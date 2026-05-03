// app/api/comentarios/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import {
  createComentario,
  getComentariosPorPost,
  getUsuarioByEmail,
} from '@/lib/db';

// Rota GET: Busca os comentários de um Post específico
export async function GET(request) {
  // Pegamos o postId que virá na URL, por exemplo: /api/comentarios?postId=2
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json(
      { error: 'O ID do Post é obrigatório.' },
      { status: 400 },
    );
  }

  try {
    const comentarios = await getComentariosPorPost(postId);
    return NextResponse.json(comentarios);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar comentários.' },
      { status: 500 },
    );
  }
}

// Rota POST: Recebe um novo comentário e grava
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Acesso negado. Registe-se ou faça login para comentar.' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    if (!body.postId || !body.texto || body.texto.trim() === '') {
      return NextResponse.json(
        { error: 'O texto do comentário é obrigatório.' },
        { status: 400 },
      );
    }

    // Busca o avatar do utilizador logado no banco de dados para anexar ao comentário
    const usuarioLogado = await getUsuarioByEmail(session.user.email);
    const avatarDoAutor = usuarioLogado ? usuarioLogado.avatarUrl : '';

    const novoComentario = await createComentario({
      postId: body.postId,
      autorNome: session.user.name,
      texto: body.texto,
      avatarUrl: avatarDoAutor, // Passa o avatar para gravar
    });

    return NextResponse.json(novoComentario, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao gravar o comentário no banco de dados.' },
      { status: 500 },
    );
  }
}
