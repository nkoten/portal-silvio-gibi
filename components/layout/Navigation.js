// components/layout/Navigation.js

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import {
  BookOpen,
  Award,
  Image as ImageIcon,
  Waves,
  Video,
  Newspaper,
  MessageCircle,
  HeartHandshake,
  Globe,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';
import Link from 'next/link'; // Importamos o Link do Next.js para navegação rápida

export default function Navigation() {
  const { data: session } = useSession();

  const linksPrincipais = [
    { nome: 'Matérias', icone: BookOpen, href: '#materias' },
    { nome: 'Currículo e Títulos', icone: Award, href: '#curriculo' },
    { nome: 'Fotos', icone: ImageIcon, href: '#fotos' },
    { nome: 'Galeria Bodyboarding', icone: Waves, href: '#bodyboard' },
    { nome: 'Vídeos', icone: Video, href: '#videos' },
    { nome: 'Reportagens', icone: Newspaper, href: '#reportagens' },
    { nome: 'Canal do WhatsApp', icone: MessageCircle, href: '#whatsapp' },
    {
      nome: 'Projeto Escola Praia Grande',
      icone: ShieldCheck,
      href: '#projeto',
    },
    { nome: 'Federações Linkadas', icone: Globe, href: '#federacoes' },
    { nome: 'Apoio e Colaboradores', icone: HeartHandshake, href: '#apoio' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {linksPrincipais.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow hover:border-blue-500 dark:hover:border-cyan-600 group"
          >
            <div className="p-2 bg-blue-50 dark:bg-zinc-800 rounded-lg text-blue-600 dark:text-cyan-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <link.icone size={20} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
              {link.nome}
            </span>
          </a>
        ))}

        {/* Botão de Mensagens: Só aparece para quem tem sessão ativa */}
        {session ? (
          <>
            {/* mensagens */}
            <Link
              href="/mensagens"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-xl shadow-sm hover:shadow-md hover:from-blue-700 hover:to-cyan-700 transition-all text-white group md:col-span-2 lg:col-span-1"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <span className="font-bold text-sm">Mensagens</span>
            </Link>

            {/* perfil */}
            <Link
              href="/perfil"
              className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-cyan-600 transition-all group"
            >
              <div className="p-2 bg-blue-50 dark:bg-zinc-800 rounded-lg text-blue-600 dark:text-cyan-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <User size={20} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
                Meu Perfil
              </span>
            </Link>
          </>
        ) : (
          /* Botão de Entrar no Chat: Só aparece para visitantes */
          <Link
            href="/chat-login"
            className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all group md:col-span-2 lg:col-span-1"
          >
            <div className="p-2 bg-gray-200 dark:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300">
              <MessageSquare size={20} />
            </div>
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Entrar no Chat (Visitantes)
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
