"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";
import { usePathname } from "next/navigation";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <Droplet className="mx-auto mb-6 h-12 w-12 text-primary" />
        <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
        <Link href="/">
          <Button className="btn-glow mt-8 border-0 text-primary-foreground">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

