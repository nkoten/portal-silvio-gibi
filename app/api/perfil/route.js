// app/api/perfil/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUsuarioByEmail, updateUsuario } from '@/lib/db';

// GET: Retorna os dados completos do utilizador logado
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const usuario = await getUsuarioByEmail(session.user.email);
    if (!usuario)
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 },
      );

    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 },
    );
  }
}

// PUT: Salva as alterações feitas pelo utilizador
export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.email) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }

  try {
    const dados = await request.json();
    const emailAntigoDaSessao = session.user.email;

    await updateUsuario(emailAntigoDaSessao, {
      nome: dados.nome,
      email: dados.email, // Salva o email novo (mesmo que seja igual)
      bio: dados.bio,
      avatarUrl: dados.avatarUrl,
      capaUrl: dados.capaUrl,
      telefone: dados.telefone,
    });

    return NextResponse.json({ success: true, message: 'Perfil atualizado!' });
  } catch (error) {
    console.error('ERRO COMPLETO:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno.' },
      { status: 500 },
    );
  }
}
