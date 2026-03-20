import OpenAI from 'openai';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { scrapeImages } from '../db/schema';

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

// async function main(content: string) {
//   const completion = await openai.chat.completions.create({
//     model: "google/gemma-2-27b-it",
//     messages: [{"role": "user","content": content}],
//     temperature: 0.2,
//     top_p: 0.7,
//     max_tokens: 1024,
//     stream: true,
//   })

//   for await (const chunk of completion) {
//     process.stdout.write(chunk.choices[0]?.delta?.content || '')
//   }
// }

// let content = "What is multi-threading ?"
// main(content);


type ImageRow = {
  id: string;
  query: string;
  imageAlt: string;
  title: string | null;
  description: string | null;
  tags: string[] | null;
};

type GenerationResult = {
  updated: number;
  skipped: number;
  failed: number;
  failures: Array<{ id: string; reason: string }>;
};

const extractJsonObject = (text: string | null | undefined): string | null => {
  if (!text) return null;

  let candidate = text.trim();

  // Handle markdown code fences if present.
  const fenceStart = candidate.indexOf("```");
  if (fenceStart !== -1) {
    const fenceEnd = candidate.lastIndexOf("```");
    if (fenceEnd > fenceStart) {
      candidate = candidate.slice(fenceStart + 3, fenceEnd).trim();
      if (candidate.toLowerCase().startsWith("json")) {
        candidate = candidate.slice(4).trim();
      }
    }
  }

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1).trim();
};

const normalizeJsonString = (value: string): string => {
  let normalized = value
    .replace(/[\u201C\u201D]/g, "\"") // smart double quotes
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/^\uFEFF/, "") // BOM
    .trim();

  // If the payload appears to use single quotes consistently, swap to double quotes.
  if (!normalized.includes("\"") && normalized.includes("'")) {
    normalized = normalized.replace(/'/g, "\"");
  }

  // Remove trailing commas before } or ]
  normalized = normalized.replace(/,\s*([}\]])/g, "$1");

  return normalized;
};

const parseJsonPayload = (raw: string): { title?: unknown; description?: unknown; tags?: unknown } | null => {
  const candidate = extractJsonObject(raw);
  if (!candidate) return null;

  const normalized = normalizeJsonString(candidate);
  try {
    return JSON.parse(normalized);
  } catch {
    return null;
  }
};

const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map((tag) => String(tag ?? "").trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(normalized));
};

const shouldGenerateForImage = (image: ImageRow): {
  needsTitle: boolean;
  needsDescription: boolean;
  needsTags: boolean;
} => {
  const needsTitle = !(typeof image.title === "string" && image.title.trim().length > 0);
  const needsDescription = !(typeof image.description === "string" && image.description.trim().length > 0);
  const needsTags = !(Array.isArray(image.tags) && image.tags.length > 0);
  return { needsTitle, needsDescription, needsTags };
};

const buildUpdatePayload = (
  parsed: { title?: unknown; description?: unknown; tags?: unknown },
  needs: { needsTitle: boolean; needsDescription: boolean; needsTags: boolean }
): { title?: string; description?: string; tags?: string[] } | null => {
  const update: { title?: string; description?: string; tags?: string[] } = {};

  if (needs.needsTitle) {
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    if (!title) return null;
    update.title = title;
  }

  if (needs.needsDescription) {
    const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
    if (!description) return null;
    update.description = description;
  }

  if (needs.needsTags) {
    const tags = normalizeTags(parsed.tags);
    if (!tags.length) return null;
    update.tags = tags;
  }

  return update;
};

const RETRY_DELAY_MS = 3000;
const MAX_GENERATION_ATTEMPTS = 3;

const delay = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function generateTextForImageIds(imageIds: string[]): Promise<GenerationResult | null> {
  try {
    if (!imageIds.length) {
      return { updated: 0, skipped: 0, failed: 0, failures: [] };
    }

    // 1. call db and loop through each row
    const images = await db
      .select({
        id: scrapeImages.id,
        query: scrapeImages.query,
        imageAlt: scrapeImages.imageAlt,
        title: scrapeImages.title,
        description: scrapeImages.description,
        tags: scrapeImages.tags,
      })
      .from(scrapeImages)
      .where(inArray(scrapeImages.id, imageIds));

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const failures: Array<{ id: string; reason: string }> = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const content = String(image.imageAlt ?? "").trim() || String(image.query ?? "").trim();

      const needs = shouldGenerateForImage(image);

      if (!content) {
        failed++;
        failures.push({ id: image.id, reason: "Missing imageAlt or query context" });
        continue;
      }
      if (!needs.needsTitle && !needs.needsDescription && !needs.needsTags) {
        skipped++;
        continue;
      }

      let attempt = 0;
      while (attempt < MAX_GENERATION_ATTEMPTS) {
        attempt += 1;
        const retryNote =
          attempt > 1
            ? "\nYour previous response was invalid JSON. Return ONLY a valid JSON object."
            : "";
        let completion;
        try {
          completion = await openai.chat.completions.create({
            model: "google/gemma-2-27b-it",
            messages: [{
              "role": "user",
              "content": `
            Use the following content as context:
            ${content}

            STRICT RULES (must follow exactly)

            Title must contain exactly 10 words.
            Description must contain exactly 300 words.
            Do not write less or more than 300 words.
            Use proper paragraphs.
            Use bullet points only if needed.
            Make the text SEO friendly.
            Keep the meaning related to the given content.

            Tags must be an array of 6 to 12 short SEO tags.
            Each tag should be 1 to 3 words.
            Use lowercase only and avoid duplicates.
            Do not include hashtags.

            Return only valid JSON.
            Do not use markdown.
            Do not use backticks.
            Do not wrap JSON inside string.
            Do not add extra fields.
            Do not add "data".
            Return plain JSON object only.
            Use double quotes only and no trailing commas.
            Output must be a single JSON object on one line.

            Output format:

            {
              "title": "string",
              "description": "string",
              "tags": ["string"]
            }
            ${retryNote}
        `}],
            temperature: 0.1,
            top_p: 0.7,
            max_tokens: 2048,
            stream: false,
          });
        } catch (err: any) {
          const status = typeof err?.status === "number" ? `status ${err.status}` : "unknown status";
          const message = typeof err?.message === "string" ? err.message : "OpenAI request failed";
          console.warn(`[text-generation] ${image.id} attempt ${attempt} failed (${status}). ${message}`);
          if (attempt < MAX_GENERATION_ATTEMPTS) {
            await delay(RETRY_DELAY_MS);
          }
          continue;
        }

        const raw = completion.choices[0]?.message?.content ?? "";
        const parsed = parseJsonPayload(raw);
        if (!parsed) {
          console.warn(`[text-generation] ${image.id} attempt ${attempt} failed: Invalid JSON`);
          if (attempt < MAX_GENERATION_ATTEMPTS) {
            await delay(RETRY_DELAY_MS);
          }
          continue;
        }

        const update = buildUpdatePayload(parsed, needs);
        if (!update) {
          console.warn(`[text-generation] ${image.id} attempt ${attempt} failed: Missing fields`);
          if (attempt < MAX_GENERATION_ATTEMPTS) {
            await delay(RETRY_DELAY_MS);
          }
          continue;
        }

        try {
          await db
            .update(scrapeImages)
            .set(update)
            .where(eq(scrapeImages.id, image.id));
          updated++;
          break;
        } catch (err) {
          console.warn(`[text-generation] ${image.id} attempt ${attempt} failed: DB update error`);
          if (attempt < MAX_GENERATION_ATTEMPTS) {
            await delay(RETRY_DELAY_MS);
          }
        }
      }

      if (attempt >= MAX_GENERATION_ATTEMPTS) {
        failed++;
        failures.push({ id: image.id, reason: `Failed after ${MAX_GENERATION_ATTEMPTS} attempts` });
        await db.delete(scrapeImages).where(eq(scrapeImages.id, image.id));
      }
    }

    return { updated, skipped, failed, failures };
  }
  catch (e) {
    console.error("Error in text generation service", e);
    return null;
  }
}

export default generateTextForImageIds;
