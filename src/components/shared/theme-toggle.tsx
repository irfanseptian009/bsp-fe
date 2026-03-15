'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle Theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
