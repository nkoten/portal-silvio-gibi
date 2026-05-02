// components/posts/CommentSection.js

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Efeito para buscar os comentários assim que o componente aparecer na tela
  useEffect(() => {
    carregarComentarios();
  }, [postId]);

  const carregarComentarios = async () => {
    try {
      const response = await fetch(`/api/comentarios?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComentarios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    setEnviando(true);
    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, texto: novoComentario }),
      });

      if (response.ok) {
        setNovoComentario(''); // Limpa o campo de texto
        carregarComentarios(); // Recarrega a lista para mostrar o comentário novo
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
      {/* Cabeçalho da seção de comentários */}
      <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-4 text-sm font-medium">
        <MessageCircle size={18} />
        <span>
          {comentarios.length}{' '}
          {comentarios.length === 1 ? 'Comentário' : 'Comentários'}
        </span>
      </div>

      {/* Lista de Comentários */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
        {carregando ? (
          <p className="text-xs text-gray-400">A carregar...</p>
        ) : (
          comentarios.map((comentario) => (
            <div
              key={comentario.id}
              className="flex flex-col bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg w-fit min-w-[200px] max-w-full break-words"
            >
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {comentario.autorNome}
              </span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {comentario.texto}
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                {new Date(comentario.dataHora).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Área de Input: Só aparece para quem está logado */}
      {session ? (
        <form onSubmit={handleComentar} className="flex gap-2 items-center">
          {/* Um avatar miniatura de quem vai comentar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
          <input
            type="text"
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder={`Comentar como ${session.user.name}...`}
            className="flex-1 px-4 py-2 text-sm border rounded-full bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!novoComentario.trim() || enviando}
            className="text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enviar comentário"
          >
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="text-center text-sm text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/30 p-3 rounded-lg">
          Para participar na conversa,{' '}
          <Link
            href="/chat-login"
            className="text-blue-600 dark:text-cyan-400 hover:underline font-medium"
          >
            entre ou registe-se
          </Link>
          .
        </div>
      )}
    </div>
  );
}
