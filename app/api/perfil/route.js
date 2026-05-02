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

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const dados = await request.json();

    // Atualiza na planilha usando o email seguro da sessão
    await updateUsuario(session.user.email, {
      nome: dados.nome,
      bio: dados.bio,
      avatarUrl: dados.avatarUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao guardar as alterações.' },
      { status: 500 },
    );
  }
}
