'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
// 直接从 next-themes 导入类型
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
