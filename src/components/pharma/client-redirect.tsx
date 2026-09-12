"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * next/navigation's server-side redirect() resolves an absolute URL that,
 * on this deployment, comes out pointing at the container's internal
 * localhost:PORT instead of the public host. Client-side router.replace()
 * is unaffected (it never constructs a host), so this component is used
 * anywhere a Server Component would otherwise call redirect().
 */
export function ClientRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}
