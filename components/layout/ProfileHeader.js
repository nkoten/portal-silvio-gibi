// components/layout/ProfileHeader.js

'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, User, Camera } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { getLocalCache, setLocalCache } from '@/lib/cache';

export default function ProfileHeader() {
  const [adminData, setAdminData] = useState({
    nome: 'A carregar...',
    bio: '',
    avatarUrl: '',
    capaUrl: '',
  });

  useEffect(() => {
    // 1. Tenta carregar do cache local instantaneamente
    const dadosEmCache = getLocalCache('admin_profile_cache');
    if (dadosEmCache) {
      setAdminData(dadosEmCache);
    }

    // 2. Consulta o servidor silenciosamente para garantir que temos a versão mais nova
    async function fetchAdmin() {
      try {
        const res = await fetch('/api/admin');
        if (res.ok) {
          const data = await res.json();
          setLocalCache('admin_profile_cache', data); // Atualiza o cache
          setAdminData(data); // Atualiza a tela
        }
      } catch (error) {
        console.error('Erro ao buscar dados do admin:', error);
      }
    }
    fetchAdmin();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 shadow-sm pb-6">
      {/* Capa de Fundo com Imagem Dinâmica */}
      <div
        className="h-48 md:h-80 w-full relative bg-gray-200 dark:bg-zinc-800 bg-cover bg-center"
        style={{
          backgroundImage: adminData.capaUrl
            ? `url(${adminData.capaUrl})`
            : 'linear-gradient(to right, #0891b2, #1d4ed8)',
        }}
      >
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20">
          {/* Avatar Dinâmico */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200 dark:bg-zinc-800 shadow-md flex items-center justify-center">
              {adminData.avatarUrl ? (
                <img
                  src={adminData.avatarUrl}
                  alt={adminData.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={64} className="text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 mb-2 sm:mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {adminData.nome}
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 font-medium whitespace-pre-wrap">
              {adminData.bio}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500 mt-2">
              <MapPin size={16} />
              <span>Praia Grande, SP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
