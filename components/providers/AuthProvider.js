// components/providers/AuthProvider.js

'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Este componente serve como um "envelope".
 * Ele repassa as informações de login (sessão) para todos os componentes dentro dele.
 */
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
