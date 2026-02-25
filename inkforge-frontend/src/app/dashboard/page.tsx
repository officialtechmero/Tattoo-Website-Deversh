import type { Metadata } from "next";
import Dashboard from "@/views/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your generated tattoo designs and account settings.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

export default function Page() {
  return <Dashboard />;
}
