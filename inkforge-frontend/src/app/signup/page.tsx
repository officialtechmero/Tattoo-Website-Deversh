import type { Metadata } from "next";
import Signup from "@/views/Signup";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an InkForge AI account and start generating tattoo designs.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/signup",
  },
};

export default function Page() {
  return <Signup />;
}
