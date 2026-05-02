// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUsuarioByEmail, createUsuario } from '@/lib/db';

// Configuração principal do NextAuth
export const authOptions = {
  // Provedores de login (podemos adicionar Google, Facebook depois)
  providers: [
    // 1. Provedor do Administrador (Silvio)
    CredentialsProvider({
      id: 'admin-login',
      name: 'Acesso Restrito',
      credentials: {
        username: { label: 'Usuário', type: 'text', placeholder: 'admin' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials, req) {
        // Lógica simples de autorização para o dono do projeto (Silvio)
        // Mais tarde, podemos conectar isso ao Google Sheets para verificar os usuários registrados
        if (
          credentials.username === 'silvio' &&
          credentials.password === 'gibi2024' // Mude para uma senha segura
        ) {
          return { id: 'admin-1', name: 'Silvio Gibi', role: 'admin' };
        }

        // Retorna null se falhar
        return null;
      },
    }),

    // 2. Provedor de Visitantes (Para o Chat)
    CredentialsProvider({
      id: 'visitor-login',
      name: 'Acesso ao Chat',
      credentials: {
        nome: { label: 'Nome', type: 'text' },
        email: { label: 'Email', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials.nome || !credentials.email) return null;

        try {
          // Verifica se o visitante já existe no Google Sheets
          let usuario = await getUsuarioByEmail(credentials.email);

          // Se não existir, criamos o registo na hora!
          if (!usuario) {
            const novoUser = await createUsuario({
              nome: credentials.nome,
              email: credentials.email,
            });
            usuario = {
              id: novoUser.id.toString(),
              name: novoUser.nome,
              role: novoUser.role,
            };
          } else {
            usuario = {
              id: usuario.id.toString(),
              name: usuario.nome,
              role: usuario.role,
            };
          }

          return usuario;
        } catch (error) {
          console.error('Erro no login do visitante:', error);
          return null;
        }
      },
    }),
  ],

  // Páginas customizadas (podemos criar a nossa própria página de login estilizada depois)
  pages: {
    signIn: '/login',
  },

  // Estratégia de sessão usando JWT (JSON Web Token)
  session: {
    strategy: 'jwt',
  },

  // Callbacks para passar dados do usuário para o frontend
  callbacks: {
    async jwt({ token, user }) {
      // Se o usuário logou, injetamos a "role" (cargo) no token
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Repassamos a role do token para a sessão ativa
      if (token?.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// Criamos o handler que o Next.js usará para responder as requisições GET e POST
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
