"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderRing } from "@/components/ui/loader-ring";

type Job = {
  id: string;
  JobId: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type ImageItem = {
  id: string;
  query: string;
  imageLink: string;
  imageAlt: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [queryInput, setQueryInput] = useState("");
  const [totalImages, setTotalImages] = useState(100);
  const [perJob, setPerJob] = useState(100);
  const [scrolls, setScrolls] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [imagePage, setImagePage] = useState(1);
  const [totalImagePages, setTotalImagePages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    router.replace("/admin/login");
  }, [router]);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const response = await fetch("/api/admin/jobs?page=1&limit=10", { cache: "no-store" });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const json = await response.json();
      if (!response.ok) {
        setJobsError(json?.message ?? "Failed to load jobs");
        return;
      }
      setJobs(json?.data ?? []);
    } catch {
      setJobsError("Failed to load jobs");
    } finally {
      setJobsLoading(false);
    }
  }, [handleUnauthorized]);

  const loadImages = useCallback(async (page: number) => {
    setImagesLoading(true);
    setImagesError(null);
    try {
      const response = await fetch(`/api/admin/images?page=${page}&limit=20`, { cache: "no-store" });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const json = await response.json();
      if (!response.ok) {
        setImagesError(json?.message ?? "Failed to load images");
        return;
      }

      setImages(json?.data ?? []);
      setTotalImagePages(Math.max(1, Number(json?.pagination?.totalPages) || 1));
    } catch {
      setImagesError("Failed to load images");
    } finally {
      setImagesLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadImages(imagePage);
  }, [imagePage, loadImages]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    const eventSource = new EventSource("/api/admin/jobs/stream");
    const onUpdate = () => {
      void loadJobs();
    };

    eventSource.addEventListener("jobs:update", onUpdate);
    eventSource.onerror = () => {
      // Browser auto-reconnects EventSource. Keep current data until reconnect.
    };

    return () => {
      eventSource.removeEventListener("jobs:update", onUpdate);
      eventSource.close();
    };
  }, [loadJobs]);

  const onScrapeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setScrapeMessage(null);

    try {
      const response = await fetch("/api/admin/scrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: queryInput,
          totalImages,
          perJob,
          scrolls,
        }),
      });

      const json = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        setScrapeMessage(json?.message ?? "Failed to queue scrape job");
        return;
      }

      setScrapeMessage(json?.message ?? "Scrape queued");
      setQueryInput("");
      void loadJobs();
    } catch {
      setScrapeMessage("Failed to queue scrape job");
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteImage = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        return;
      }
      await loadImages(imagePage);
    } finally {
      setDeletingId(null);
    }
  };

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-normal">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Queue scrape jobs, monitor status, and manage images.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg bg-red-600 border border-border px-4 py-2 text-sm"
          >
            Logout
          </button>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold tracking-normal">Start Scraping</h2>
          <form onSubmit={onScrapeSubmit} className="mt-4 grid gap-4 md:grid-cols-4">
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={4}
              placeholder='Single query or array, e.g. ["tattoo designs","forearm tattoos"]'
              className="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Total Images</label>
                <input
                  type="number"
                  min={1}
                  value={totalImages}
                  onChange={(e) => setTotalImages(Number(e.target.value) || 1)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Per Job</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={perJob}
                  onChange={(e) => setPerJob(Number(e.target.value) || 1)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Scrolls</label>
                <input
                  type="number"
                  min={1}
                  value={scrolls}
                  onChange={(e) => setScrolls(Number(e.target.value) || 1)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {submitting ? "Queueing..." : "Queue Scrape Job"}
              </button>
            </div>
          </form>
          {scrapeMessage ? <p className="mt-3 text-sm text-muted-foreground">{scrapeMessage}</p> : null}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold tracking-normal">Scraping Jobs</h2>
          {jobsError ? <p className="mt-2 text-sm text-red-500">{jobsError}</p> : null}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2">Job ID</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {jobsLoading ? (
                  <tr>
                    <td className="py-6" colSpan={4}>
                      <div className="flex justify-center">
                        <LoaderRing size="sm" />
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td className="py-4 text-muted-foreground" colSpan={4}>No jobs yet.</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-b border-border/60">
                      <td className="py-2">{job.JobId}</td>
                      <td className="py-2 capitalize">{job.status}</td>
                      <td className="py-2">{new Date(job.created_at).toLocaleString()}</td>
                      <td className="py-2">{new Date(job.updated_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-normal">Manage Images</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImagePage((p) => Math.max(1, p - 1))}
                disabled={imagePage <= 1 || imagesLoading}
                className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-muted-foreground">Page {imagePage} / {totalImagePages}</span>
              <button
                type="button"
                onClick={() => setImagePage((p) => Math.min(totalImagePages, p + 1))}
                disabled={imagePage >= totalImagePages || imagesLoading}
                className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {imagesError ? <p className="mt-2 text-sm text-red-500">{imagesError}</p> : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {imagesLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <LoaderRing />
              </div>
            ) : images.length === 0 ? (
              <p className="text-sm text-muted-foreground">No images found.</p>
            ) : (
              images.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-border">
                  <img src={item.imageLink} alt={item.imageAlt || item.query} className="h-48 w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <p className="text-xs text-muted-foreground">{item.query}</p>
                    <button
                      type="button"
                      onClick={() => void onDeleteImage(item.id)}
                      disabled={deletingId === item.id}
                      className="w-full rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {deletingId === item.id ? "Removing..." : "Remove Image"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
