// components/layout/ProfileHeader.js

import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function ProfileHeader() {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 shadow-sm pb-6">
      {/* Capa de Fundo */}
      <div className="h-48 md:h-80 w-full relative bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-800 dark:to-blue-900">
        {/* Botão de Tema no canto superior direito da capa */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Container Principal do Perfil */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20">
          {/* Avatar (Foto de Perfil) */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200 shadow-md">
              <img
                src="https://via.placeholder.com/200" // Substituiremos pela imagem real do banco depois
                alt="Silvio Gibi"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Nome e Bio */}
          <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 mb-2 sm:mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Silvio Gibi
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 font-medium">
              Bodyboarder & Mentor
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500 mt-1">
              <MapPin size={16} />
              <span>Praia Grande, SP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
