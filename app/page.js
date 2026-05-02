// app/page.js

'use client';

import { useState } from 'react';
import ProfileHeader from '@/components/layout/ProfileHeader';
import Navigation from '@/components/layout/Navigation';
import PostForm from '@/components/posts/PostForm';
import PostFeed from '@/components/posts/PostFeed';

export default function Home() {
  // Este estado serve como um "gatilho". Quando o PostForm criar um post,
  // mudamos este valor, o que faz o PostFeed buscar os dados novamente.
  const [atualizacaoFeed, setAtualizacaoFeed] = useState(0);

  const recarregarFeed = () => {
    setAtualizacaoFeed((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12">
      <ProfileHeader />
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {/* Passamos a função recarregarFeed para o formulário */}
        <PostForm onPostCreated={recarregarFeed} />

        {/* Passamos o gatilho de atualização para o Feed */}
        <PostFeed atualizacaoTrilho={atualizacaoFeed} />
      </div>
    </main>
  );
}
