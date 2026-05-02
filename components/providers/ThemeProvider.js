// components/providers/ThemeProvider.js

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Este componente gerencia o modo claro/escuro da aplicação.
 * Ele adiciona automaticamente a classe 'dark' à tag <html> quando ativado.
 */
export default function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false);

  // Evita erros de hidratação garantindo que o tema só carrega no cliente
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
