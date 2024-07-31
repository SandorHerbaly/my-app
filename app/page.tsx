"use client"; // Add this line at the top

import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Átirányítjuk a felhasználót a dashboard oldalra
    router.push("/dashboard");
  }, [router]);

  return null;
}
