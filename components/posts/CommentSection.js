// components/posts/CommentSection.js

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { getLocalCache } from '@/lib/cache'; // Importamos o cache

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [meuAvatar, setMeuAvatar] = useState('');

  // Ao montar, carrega os comentários do post e procura a própria foto no cache
  useEffect(() => {
    carregarComentarios();

    if (session) {
      // Tenta pegar a foto no cache para usar na caixa de digitação
      const cache =
        getLocalCache('meu_perfil_cache') ||
        getLocalCache('admin_profile_cache');
      if (cache && cache.avatarUrl) {
        setMeuAvatar(cache.avatarUrl);
      }
    }
  }, [postId, session]);

  const carregarComentarios = async () => {
    try {
      const response = await fetch(`/api/comentarios?postId=${postId}`);
      if (response.ok) {
        setComentarios(await response.json());
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
        setNovoComentario('');
        carregarComentarios();
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
      <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mb-4 text-sm font-medium">
        <MessageCircle size={18} />
        <span>
          {comentarios.length}{' '}
          {comentarios.length === 1 ? 'Comentário' : 'Comentários'}
        </span>
      </div>

      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
        {carregando ? (
          <p className="text-xs text-gray-400">A carregar...</p>
        ) : (
          comentarios.map((comentario) => (
            <div key={comentario.id} className="flex gap-3 w-full">
              {/* Avatar do Autor do Comentário */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700 shrink-0 flex items-center justify-center border border-gray-200 dark:border-zinc-700 mt-1">
                {comentario.avatarUrl ? (
                  <img
                    src={comentario.avatarUrl}
                    alt={comentario.autorNome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-gray-400" />
                )}
              </div>

              {/* Balão do Comentário */}
              <div className="flex flex-col bg-gray-100 dark:bg-zinc-800/60 px-3 py-2 rounded-2xl max-w-[85%] break-words">
                <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                  {comentario.autorNome}
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">
                  {comentario.texto}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {session ? (
        <form
          onSubmit={handleComentar}
          className="flex gap-2 items-center mt-4"
        >
          {/* O Avatar da pessoa que está a digitar agora */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700 shrink-0 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
            {meuAvatar ? (
              <img
                src={meuAvatar}
                alt="Meu Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} className="text-gray-400" />
            )}
          </div>

          <input
            type="text"
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder={`Escreva um comentário...`}
            className="flex-1 px-4 py-2 text-sm border rounded-full bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!novoComentario.trim() || enviando}
            className="text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
