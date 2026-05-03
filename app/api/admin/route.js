// app/api/admin/route.js

import { NextResponse } from 'next/server';
import { getAdminProfile } from '@/lib/db';

export async function GET() {
  const admin = await getAdminProfile();

  if (!admin) {
    // Retorno de segurança caso o banco ainda não tenha carregado o admin
    return NextResponse.json({
      nome: 'Silvio Gibi',
      bio: 'Bodyboarder & Mentor',
      avatarUrl: '',
    });
  }

  return NextResponse.json(admin);
}
