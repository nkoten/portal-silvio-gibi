// components/chat/ChatBox.js

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';
import { Send } from 'lucide-react';

export default function ChatBox() {
  const { data: session } = useSession();
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Referência para rolar a tela sempre para a última mensagem
  const mensagensEndRef = useRef(null);

  const rolarParaOFinal = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Efeito 1: Carregar o histórico ao abrir o chat
  useEffect(() => {
    async function carregarHistorico() {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const dados = await res.json();
          setMensagens(dados);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico', error);
      } finally {
        setCarregando(false);
        rolarParaOFinal();
      }
    }
    carregarHistorico();
  }, []);

  // Efeito 2: Inscrever-se no Pusher para ouvir novas mensagens em tempo real
  useEffect(() => {
    // Inicializa o cliente do Pusher usando a chave pública
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    // Inscreve-se no mesmo canal que configuramos na nossa API
    const canal = pusherClient.subscribe('chat-portal');

    // Fica a ouvir o evento 'nova-mensagem'
    canal.bind('nova-mensagem', (mensagemRecebida) => {
      // Adiciona a nova mensagem à lista existente na tela
      setMensagens((mensagensAnteriores) => [
        ...mensagensAnteriores,
        mensagemRecebida,
      ]);
      rolarParaOFinal();
    });

    // Limpeza: quando o utilizador sai da página, desliga a conexão
    return () => {
      pusherClient.unsubscribe('chat-portal');
      pusherClient.disconnect();
    };
  }, []);

  // Rolar para o final sempre que a lista de mensagens for atualizada
  useEffect(() => {
    rolarParaOFinal();
  }, [mensagens]);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    const texto = novaMensagem;
    setNovaMensagem(''); // Limpa o input imediatamente para melhor experiência

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: texto }),
      });
      // Não precisamos adicionar a mensagem ao state manualmente aqui,
      // pois o Pusher vai dispará-la de volta para nós pelo evento 'nova-mensagem'
    } catch (error) {
      console.error('Erro ao enviar mensagem', error);
    }
  };

  // Se não estiver logado, não renderiza o chat (segurança extra)
  if (!session) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col h-[500px] w-full max-w-4xl mx-auto mt-8">
      {/* Cabeçalho do Chat */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-zinc-800/50 rounded-t-xl">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Chat da Comunidade
        </h2>
      </div>

      {/* Área das Mensagens (Scroll) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-950">
        {carregando ? (
          <div className="text-center text-sm text-gray-500 mt-4">
            Carregando histórico...
          </div>
        ) : mensagens.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-4">
            Seja o primeiro a enviar uma mensagem!
          </div>
        ) : (
          mensagens.map((msg) => {
            // Verifica se a mensagem foi enviada pelo utilizador logado para alinhar à direita
            const isMinhaMensagem = msg.remetenteNome === session.user.name;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMinhaMensagem ? 'items-end' : 'items-start'}`}
              >
                <span className="text-xs text-gray-500 mb-1 ml-1 mr-1">
                  {msg.remetenteNome}
                </span>
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                    isMinhaMensagem
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.mensagem}
                </div>
              </div>
            );
          })
        )}
        <div ref={mensagensEndRef} />
      </div>

      {/* Área do Input de Texto */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-xl">
        <form onSubmit={enviarMensagem} className="flex gap-2">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Escreva a sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-full dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!novaMensagem.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
