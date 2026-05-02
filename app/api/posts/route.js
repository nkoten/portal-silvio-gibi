// app/api/posts/route.js

import { NextResponse } from 'next/server';
import { createPost, getAllPosts } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // O caminho para as tuas configurações do NextAuth

export async function GET() {
  try {
    // Busca todos os posts do Google Sheets
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar publicações.' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  // Segurança Rigorosa (Regra 10): Verifica se quem está a chamar a API está logado
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas o administrador pode criar posts.' },
      { status: 401 },
    );
  }

  try {
    // Recebe os dados do frontend
    const body = await request.json();

    // Validação básica
    if (!body.titulo || !body.conteudo) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios.' },
        { status: 400 },
      );
    }

    // Grava no Google Sheets usando a nossa lib de banco de dados
    const result = await createPost(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return NextResponse.json(
      { error: 'Erro ao gravar publicação no banco de dados.' },
      { status: 500 },
    );
  }
}
