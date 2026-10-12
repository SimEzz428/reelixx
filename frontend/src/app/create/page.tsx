"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy entry point: forwards (with any prefill query params) to the Studio. */
export default function CreateRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/studio${window.location.search}`);
  }, [router]);
  return null;
}
