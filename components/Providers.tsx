"use client";

import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // We can add any other client-side providers here later
  return <>{children}</>;
}
