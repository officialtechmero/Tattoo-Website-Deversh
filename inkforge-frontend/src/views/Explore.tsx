"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";

type ExploreImage = {
  id: string;
  query: string;
  imageLink: string;
  imageAlt: string;
  created_at: string;
};

type ExploreResponse = {
  status: string;
  data: ExploreImage[];
  pagination: {
    page: number;
    limit: number;
    total: number | null;
    totalPages: number | null;
  };
};

type CachedPage = {
  data: ExploreImage[];
  total: number | null;
  totalPages: number | null;
  expiresAt: number;
};

const ITEMS_PER_PAGE = 30;
const SKELETON_ITEMS = 12;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_CLEANUP_MS = 60 * 1000;
const SCROLL_TO_TOP_TIMEOUT_MS = 900;

export default function Explore() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ExploreImage[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<ExploreImage | null>(null);
  const cacheRef = useRef<Map<string, CachedPage>>(new Map());

  const getCachedPage = useCallback((cacheKey: string): CachedPage | null => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return cached;
  }, []);

  const pruneExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of cacheRef.current.entries()) {
      if (now > value.expiresAt) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(pruneExpiredCache, CACHE_CLEANUP_MS);
    return () => clearInterval(timer);
  }, [pruneExpiredCache]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchPage = useCallback(
    async (targetPage: number, includeTotal: boolean, signal?: AbortSignal): Promise<CachedPage> => {
      const cacheKey = `${debouncedSearch}::${targetPage}`;
      const cached = getCachedPage(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(ITEMS_PER_PAGE),
        withTotal: includeTotal ? "1" : "0",
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const response = await fetch(`/api/explore?${params.toString()}`, {
        method: "GET",
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const json = (await response.json()) as ExploreResponse;
      const payload: CachedPage = {
        data: json.data ?? [],
        total: json.pagination?.total ?? null,
        totalPages: json.pagination?.totalPages ?? null,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      cacheRef.current.set(cacheKey, payload);
      return payload;
    },
    [debouncedSearch, getCachedPage]
  );

  const prefetchPage = useCallback(
    async (targetPage: number) => {
      if (targetPage < 1) return;
      const cacheKey = `${debouncedSearch}::${targetPage}`;
      if (getCachedPage(cacheKey)) return;

      try {
        await fetchPage(targetPage, false);
      } catch {
        // Best effort prefetch; ignore failures here.
      }
    },
    [debouncedSearch, fetchPage, getCachedPage]
  );

  const getDownloadUrl = useCallback((item: ExploreImage) => {
    const name = (item.imageAlt || item.query || `tattoo-${item.id}`).trim();
    const params = new URLSearchParams({
      url: item.imageLink,
      name,
    });
    return `/api/download-image?${params.toString()}`;
  }, []);

  const handleDownload = useCallback(
    async (item: ExploreImage) => {
      try {
        setDownloadingId(item.id);
        const response = await fetch(getDownloadUrl(item), {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${(item.imageAlt || item.query || `tattoo-${item.id}`).replace(/[^\w.-]+/g, "_")}.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      } catch {
        setError("Failed to download image.");
      } finally {
        setDownloadingId(null);
      }
    },
    [getDownloadUrl]
  );

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      const cacheKey = `${debouncedSearch}::${page}`;
      const cached = getCachedPage(cacheKey);
      setLoading(!cached);
      setError(null);

      try {
        const includeTotal = page === 1 || totalPages === null;
        const result = cached ?? (await fetchPage(page, includeTotal, controller.signal));
        setImages(result.data);

        if (result.total !== null) {
          setTotal(result.total);
        }
        if (result.totalPages !== null) {
          setTotalPages(result.totalPages);
        } else if (result.data.length < ITEMS_PER_PAGE) {
          setTotalPages(Math.max(page, 1));
        }

        const knownTotalPages = result.totalPages ?? totalPages;
        if (result.data.length === ITEMS_PER_PAGE && (knownTotalPages === null || page < knownTotalPages)) {
          void prefetchPage(page + 1);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Failed to load images from database.");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [page, debouncedSearch, fetchPage, prefetchPage, totalPages, getCachedPage]);

  const pageLabel = useMemo(() => {
    const maxPages = Math.max(1, totalPages ?? 1);
    return `Page ${page} of ${maxPages}`;
  }, [page, totalPages]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const maxPages = Math.max(1, totalPages ?? 1);
      const boundedPage = Math.min(maxPages, Math.max(1, nextPage));
      if (boundedPage === page) return;
      setPage(boundedPage);
    },
    [page, totalPages]
  );

  const goToNextPage = useCallback(() => {
    const maxPages = Math.max(1, totalPages ?? 1);
    const boundedPage = Math.min(maxPages, page + 1);
    if (boundedPage === page) return;

    const startedAt = performance.now();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const waitUntilTop = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || 0;
      const timedOut = performance.now() - startedAt > SCROLL_TO_TOP_TIMEOUT_MS;

      if (currentY <= 2 || timedOut) {
        window.scrollTo({ top: 0, behavior: "auto" });
        setPage(boundedPage);
        return;
      }

      window.requestAnimationFrame(waitUntilTop);
    };

    window.requestAnimationFrame(waitUntilTop);
  }, [page, totalPages]);

  useEffect(() => {
    if (!activeImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-16 pt-24">
        <div className="mb-6">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Explore <span className="text-gradient">Designs</span>
          </h1>
          <p className="text-muted-foreground">Explore the most popular and trending tattoo styles</p>
        </div>

        <div className="mb-6 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by query..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {loading && images.length === 0 ? (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5">
            {Array.from({ length: SKELETON_ITEMS }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="mb-4 h-56 break-inside-avoid animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images found.</p>
        ) : (
          <>
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5">
              {images.map((item) => (
                <article
                  key={item.id}
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <img
                    src={item.imageLink}
                    alt={item.imageAlt || item.query || "Scraped tattoo image"}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full cursor-zoom-in object-contain"
                    onClick={() => setActiveImage(item)}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
                  <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    View larger
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDownload(item)}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity duration-200 hover:bg-background group-hover:opacity-100"
                    aria-label="Download image"
                  >
                    {downloadingId === item.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={loading || page <= 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm text-muted-foreground">
                {pageLabel}
                {typeof total === "number" ? ` (${total} images)` : ""}
              </p>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={loading || page >= Math.max(1, totalPages ?? 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            {loading && (
              <p className="mt-3 text-center text-xs text-muted-foreground" aria-live="polite">
                Updating page...
              </p>
            )}
          </>
        )}
      </main>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-h-[95vh] max-w-5xl overflow-hidden rounded-2xl border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground"
              aria-label="Close image preview"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={activeImage.imageLink}
              alt={activeImage.imageAlt || activeImage.query || "Tattoo preview"}
              className="max-h-[95vh] w-full object-contain"
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
