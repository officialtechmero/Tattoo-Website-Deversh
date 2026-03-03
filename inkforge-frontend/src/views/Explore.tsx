"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search } from "lucide-react";

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
};

const ITEMS_PER_PAGE = 20;

export default function Explore() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ExploreImage[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const cacheRef = useRef<Map<string, CachedPage>>(new Map());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchPage = useCallback(
    async (targetPage: number, includeTotal: boolean, signal?: AbortSignal) => {
      const cacheKey = `${debouncedSearch}::${targetPage}`;
      const cached = cacheRef.current.get(cacheKey);

      if (cached) {
        return cached;
      }

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
      };

      cacheRef.current.set(cacheKey, payload);
      return payload;
    },
    [debouncedSearch]
  );

  const prefetchPage = useCallback(
    async (targetPage: number) => {
      if (targetPage < 1) return;
      const cacheKey = `${debouncedSearch}::${targetPage}`;
      if (cacheRef.current.has(cacheKey)) return;

      try {
        await fetchPage(targetPage, false);
      } catch {
        // Ignore prefetch errors; foreground fetch handles errors.
      }
    },
    [debouncedSearch, fetchPage]
  );

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      const hasCache = cacheRef.current.has(`${debouncedSearch}::${page}`);
      setLoading(!hasCache && page === 1);
      setError(null);

      try {
        const includeTotal = page === 1;
        const result = await fetchPage(page, includeTotal, controller.signal);

        setImages(result.data);

        if (result.total !== null) {
          setTotal(result.total);
        }

        if (result.totalPages !== null) {
          setTotalPages(result.totalPages);
        } else if (result.data.length < ITEMS_PER_PAGE) {
          setTotalPages(Math.max(1, page));
        }

        if (result.totalPages !== null && page < result.totalPages) {
          void prefetchPage(page + 1);
        } else if (result.data.length === ITEMS_PER_PAGE && result.totalPages === null) {
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
  }, [page, debouncedSearch, fetchPage, prefetchPage]);

  const pageLabel = useMemo(() => `Page ${page} of ${totalPages}`, [page, totalPages]);
  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-16 pt-24">
        <div className="mb-6">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Explore <span className="text-gradient">Designs</span>
          </h1>
          <p className="text-muted-foreground">Showing scraped images stored in your backend database.</p>
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

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading images...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images found.</p>
        ) : (
          <>
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5">
              {images.map((item) => (
                <article
                  key={item.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <a href={item.imageLink} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={item.imageLink}
                      alt={item.imageAlt || item.query || "Scraped tattoo image"}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full object-contain"
                    />
                  </a>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {pageLabel} ({total} images)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
