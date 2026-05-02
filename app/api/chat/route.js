// app/api/chat/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createMensagem, getHistoricoMensagens } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';

// Rota GET: Busca o histórico de mensagens do Google Sheets
export async function GET() {
  try {
    const historico = await getHistoricoMensagens();
    return NextResponse.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico de mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar mensagens.' },
      { status: 500 },
    );
  }
}

// Rota POST: Recebe uma nova mensagem, grava no Sheets e avisa o Pusher
export async function POST(request) {
  // 1. Verificação de Segurança: Só pessoas logadas (Admin ou Visitantes) podem enviar mensagens
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Precisa estar logado para enviar mensagens.' },
      { status: 401 },
    );
  }

  try {
    const { mensagem } = await request.json();

    if (!mensagem || mensagem.trim() === '') {
      return NextResponse.json(
        { error: 'A mensagem não pode estar vazia.' },
        { status: 400 },
      );
    }

    const remetenteNome = session.user.name;

    // 2. Grava no Google Sheets para termos o histórico
    const novaMensagemDb = await createMensagem({
      remetenteNome: remetenteNome,
      mensagem: mensagem,
    });

    // 3. Monta o objeto da mensagem que vai para a tela dos utilizadores
    const mensagemParaTela = {
      id: novaMensagemDb.id,
      remetenteNome: remetenteNome,
      mensagem: mensagem,
      dataHora: novaMensagemDb.dataHora,
    };

    // 4. A Mágica do Tempo Real: Dispara a mensagem via Pusher
    // 'chat-portal' é o nome do canal, 'nova-mensagem' é o nome do evento
    await pusherServer.trigger(
      'chat-portal',
      'nova-mensagem',
      mensagemParaTela,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a mensagem.' },
      { status: 500 },
    );
  }
}
