// app/mensagens/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ChatBox from '@/components/chat/ChatBox';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Mensagens | Silvio Gibi',
};

export default async function MensagensPage() {
  // Segurança Rigorosa (Regra 10): Verificamos a sessão diretamente no servidor
  const session = await getServerSession(authOptions);

  // Se a pessoa não estiver logada, é chutada imediatamente de volta para a home
  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho de Navegação */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Voltar ao Portal
          </Link>

          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Logado como:
            </p>
            <p className="font-bold text-gray-900 dark:text-white">
              {session.user.name}
            </p>
          </div>
        </div>

        {/* Instância do nosso componente de Chat */}
        <ChatBox />
      </div>
    </div>
  );
}
