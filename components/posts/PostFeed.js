// components/posts/PostFeed.js

'use client';

import { useEffect, useState } from 'react';
import { Calendar, User } from 'lucide-react';
import CommentSection from './CommentSection';

export default function PostFeed({ atualizacaoTrilho }) {
  const [posts, setPosts] = useState([]);
  const [adminAvatar, setAdminAvatar] = useState('');
  const [adminNome, setAdminNome] = useState('Silvio Gibi');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Busca os posts e os dados do admin simultaneamente
        const [postsRes, adminRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/admin'),
        ]);

        if (postsRes.ok) setPosts(await postsRes.json());
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setAdminAvatar(adminData.avatarUrl);
          setAdminNome(adminData.nome);
        }
      } catch (error) {
        console.error('Erro ao buscar feed:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [atualizacaoTrilho]);

  if (carregando)
    return (
      <div className="text-center text-gray-500 py-8">
        A carregar publicações...
      </div>
    );
  if (posts.length === 0)
    return (
      <div className="text-center text-gray-500 py-8">
        Ainda não há publicações.
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm"
        >
          {/* NOVO: Cabeçalho do Post Estilo Facebook */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0 flex items-center justify-center border border-gray-100 dark:border-zinc-700">
              {adminAvatar ? (
                <img
                  src={adminAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                {adminNome}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                <time>
                  {new Date(post.data).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </div>
          </div>

          <div className="px-4 pb-2 text-gray-800 dark:text-gray-200 font-bold text-lg">
            {post.titulo}
          </div>

          <div className="px-4 pb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
            {post.conteudo}
          </div>

          {post.imagemUrl && (
            <div className="w-full bg-gray-100 dark:bg-zinc-950 border-t border-b border-gray-100 dark:border-zinc-800">
              <img
                src={post.imagemUrl}
                alt={post.titulo}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>
          )}

          <div className="p-4">
            <CommentSection postId={post.id} />
          </div>
        </article>
      ))}
    </div>
  );
}
