// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUsuarioByEmail, createUsuario } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      // Usamos o ID padrão 'credentials' para coincidir com o componente LoginForm
      id: 'credentials',
      name: 'Acesso Portal',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
        // Campos extras para quando for login de visitante
        nome: { label: 'Nome', type: 'text' },
        email: { label: 'Email', type: 'text' },
        isVisitor: { type: 'text' }, // Flag para diferenciar os tipos de login
      },
      async authorize(credentials) {
        try {
          // --- LÓGICA DO ADMIN (Silvio) ---
          if (
            credentials.username === 'silvio' &&
            credentials.password === 'gibi2024'
          ) {
            console.log('Login: Admin detectado');
            return {
              id: 'admin-1',
              name: 'Silvio Gibi',
              email: 'silvio@exemplo.com',
              role: 'admin',
            };
          }

          // --- LÓGICA DO VISITANTE ---
          if (credentials.isVisitor === 'true') {
            console.log('Login: Visitante tentando acesso');
            let usuario = await getUsuarioByEmail(credentials.email);

            if (!usuario) {
              console.log('Login: Criando novo visitante no Sheets');
              const novoUser = await createUsuario({
                nome: credentials.nome,
                email: credentials.email,
              });
              return {
                id: novoUser.id.toString(),
                name: novoUser.nome,
                email: credentials.email,
                role: 'visitante',
              };
            }

            return {
              id: usuario.id.toString(),
              name: usuario.nome,
              email: usuario.email,
              role: usuario.role,
            };
          }

          // Se chegou aqui e não caiu em nenhum caso, as credenciais estão erradas
          return null;
        } catch (error) {
          console.error('Erro no processo de Authorize:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redireciona erros para a mesma página
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  // Ativa logs detalhados no terminal do VS Code para ajudar a gente
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
