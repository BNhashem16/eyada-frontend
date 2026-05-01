"use client";

import { QueryProvider } from "./query-provider";
import { ToastProvider } from "./toast-provider";
import { ThemeProvider } from "./theme-provider";
import { LanguageProvider } from "./language-provider";

interface ProvidersProps {
  children: React.ReactNode;
  nonce?: string;
}

export function Providers({ children, nonce }: ProvidersProps) {
  return (
    <LanguageProvider>
      <ThemeProvider nonce={nonce}>
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export { ThemeProvider, useTheme } from "./theme-provider";
export { LanguageProvider, useLanguage } from "./language-provider";
