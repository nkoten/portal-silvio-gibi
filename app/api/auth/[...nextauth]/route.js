// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Configuração principal do NextAuth
export const authOptions = {
  // Provedores de login (podemos adicionar Google, Facebook depois)
  providers: [
    CredentialsProvider({
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
          return { id: '1', name: 'Silvio Gibi', role: 'admin' };
        }

        // Retorna null se falhar
        return null;
      },
    }),
  ],

  // Páginas customizadas (podemos criar a nossa própria página de login estilizada depois)
  pages: {
    // signIn: '/login',
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
