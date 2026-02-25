const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const siteUrl = envSiteUrl?.replace(/\/+$/, "") || "http://localhost:3000";
