// components/posts/PostFeed.js

'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import CommentSection from './CommentSection';

export default function PostFeed({ atualizacaoTrilho }) {
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca os posts sempre que o componente montar ou o 'atualizacaoTrilho' mudar
  useEffect(() => {
    async function carregarPosts() {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Erro ao buscar feed:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregarPosts();
  }, [atualizacaoTrilho]); // O trilho serve para forçar o recarregamento ao criar um novo post

  if (carregando) {
    return (
      <div className="text-center text-gray-500 py-8">
        A carregar publicações...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Ainda não há publicações.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm"
        >
          {/* Cabeçalho do Card */}
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
              {post.titulo}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
              <Calendar size={14} />
              <time>
                {new Date(post.data).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </div>

          {/* Conteúdo Textual */}
          <div className="p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {post.conteudo}
          </div>

          {/* Imagem (Se existir) */}
          {post.imagemUrl && (
            <div className="w-full bg-gray-100 dark:bg-zinc-950 border-t border-b border-gray-100 dark:border-zinc-800">
              <img
                src={post.imagemUrl}
                alt={post.titulo}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>
          )}

          {/* 
            Nossa nova Seção de Comentários! 
            Passamos o post.id para que o componente saiba de quem são os comentários 
          */}
          <div className="p-4">
            <CommentSection postId={post.id} />
          </div>
        </article>
      ))}
    </div>
  );
}
