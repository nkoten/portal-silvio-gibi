// lib/pusher.js

import Pusher from 'pusher';

/**
 * Inicializa a instância do Pusher no lado do servidor.
 * Usamos as variáveis do .env.local para manter as credenciais seguras.
 */
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true, // Garante que a comunicação seja criptografada
});
