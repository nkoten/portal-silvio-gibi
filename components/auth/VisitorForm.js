// components/auth/VisitorForm.js

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

export default function VisitorForm() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    // Usamos o id "visitor-login" que configuramos no NextAuth
    const result = await signIn('visitor-login', {
      nome,
      email,
      redirect: false,
    });

    if (result?.error) {
      setErro('Ocorreu um erro ao aceder ao chat. Tente novamente.');
      setCarregando(false);
    } else {
      // Se der certo, redirecionamos para a página principal (ou para a futura rota do chat)
      router.push('/');
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800"
    >
      <div className="text-center mb-4 flex flex-col items-center">
        <div className="bg-blue-100 dark:bg-zinc-800 p-3 rounded-full mb-3 text-blue-600 dark:text-cyan-400">
          <MessageSquare size={32} />
        </div>
        <h2 className="text-2xl font-bold">Entrar no Chat</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
          Registe-se ou faça login com o seu email para interagir com a
          comunidade.
        </p>
      </div>

      {erro && (
        <div className="bg-red-100 text-red-600 p-3 rounded-md text-sm text-center">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">O seu Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: João Silva"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">O seu Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="joao@exemplo.com"
        />
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-all shadow-md disabled:opacity-50"
      >
        {carregando ? 'A processar...' : 'Aceder ao Chat'}
      </button>
    </form>
  );
}
