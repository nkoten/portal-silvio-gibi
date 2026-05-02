// app/api/upload/route.js

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Configurar o Cloudinary com as tuas variáveis
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  // Segurança Rigorosa: Só o admin pode fazer upload de imagens
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  try {
    const { imagemBase64 } = await request.json();

    if (!imagemBase64) {
      return NextResponse.json(
        { error: 'Nenhuma imagem enviada.' },
        { status: 400 },
      );
    }

    // Faz o upload para o Cloudinary e guarda na pasta 'silvio_gibi_portal'
    const uploadResponse = await cloudinary.uploader.upload(imagemBase64, {
      folder: 'silvio_gibi_portal',
    });

    // Retorna a URL segura (https) da imagem gerada pelo Cloudinary
    return NextResponse.json(
      { secure_url: uploadResponse.secure_url },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erro no upload para o Cloudinary:', error);
    return NextResponse.json(
      { error: 'Falha ao processar a imagem.' },
      { status: 500 },
    );
  }
}
