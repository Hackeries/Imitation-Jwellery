"use client";

import { useEffect, useState } from "react";

interface ClientBodyProps {
  children: React.ReactNode;
}

export default function ClientBody({ children }: ClientBodyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render children after client-side hydration
  return (
    <body suppressHydrationWarning>
      {isMounted ? children : null}
    </body>
  );
}