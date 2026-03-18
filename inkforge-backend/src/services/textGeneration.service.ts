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
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
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

export async function generateTextForImageIds(imageIds: string[]): Promise<GenerationResult | null> {
  try {
    if (!imageIds.length) {
      return { updated: 0, skipped: 0, failed: 0, failures: [] };
    }

    // 1. call db and loop through each row
    const images = await db
      .select({
        id: scrapeImages.id,
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
      const content = String(image.imageAlt ?? "").trim();

      const needs = shouldGenerateForImage(image);

      if (!content) {
        skipped++;
        failures.push({ id: image.id, reason: "Missing imageAlt context" });
        continue;
      }
      if (!needs.needsTitle && !needs.needsDescription && !needs.needsTags) {
        skipped++;
        continue;
      }

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

            Output format:

            {
              "title": "string",
              "description": "string",
              "tags": ["string"]
            }
        `}],
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 1024,
          stream: false,
        });
      } catch (err: any) {
        failed++;
        const status = typeof err?.status === "number" ? `status ${err.status}` : "unknown status";
        const message = typeof err?.message === "string" ? err.message : "OpenAI request failed";
        failures.push({ id: image.id, reason: `OpenAI ${status}: ${message}` });
        continue;
      }

      const raw = completion.choices[0]?.message?.content ?? "";
      const jsonText = extractJsonObject(raw);
      if (!jsonText) {
        failed++;
        failures.push({ id: image.id, reason: "No JSON object returned" });
        continue;
      }

      let parsed: { title?: unknown; description?: unknown; tags?: unknown };
      try {
        parsed = JSON.parse(jsonText);
      } catch (err) {
        failed++;
        failures.push({ id: image.id, reason: "Invalid JSON returned" });
        continue;
      }

      const update = buildUpdatePayload(parsed, needs);
      if (!update) {
        failed++;
        failures.push({ id: image.id, reason: "Missing title, description, or tags" });
        continue;
      }

      await db
        .update(scrapeImages)
        .set(update)
        .where(eq(scrapeImages.id, image.id));

      updated++;
    }

    return { updated, skipped, failed, failures };
  }
  catch (e) {
    console.error("Error in text generation service", e);
    return null;
  }
}

export default generateTextForImageIds;
