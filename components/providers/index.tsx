'use client';

import { QueryProvider } from './query-provider';
import { ToastProvider } from './toast-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}

export { ThemeProvider, useTheme } from './theme-provider';
