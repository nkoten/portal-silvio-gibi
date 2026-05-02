// components/auth/LoginForm.js

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    // Chamamos a função signIn do NextAuth passando o provedor "credentials"
    const result = await signIn('credentials', {
      username: usuario,
      password: senha,
      redirect: false, // Não redireciona automaticamente para podermos tratar o erro
    });

    if (result?.error) {
      setErro('Usuário ou senha incorretos.');
      setCarregando(false);
    } else {
      // Se deu certo, enviamos o Silvio para a página inicial
      router.push('/');
      router.refresh(); // Atualiza os dados da tela
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Entre para gerenciar o portal
        </p>
      </div>

      {erro && (
        <div className="bg-red-100 text-red-600 p-3 rounded-md text-sm text-center">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Usuário</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: silvio"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
      >
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
