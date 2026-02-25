import type { Metadata } from "next";
import Login from "@/views/Login";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to InkForge AI to manage your tattoo designs and generations.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function Page() {
  return <Login />;
}
