// components/layout/ProfileHeader.js

import React from 'react';
import { Camera } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <div className="relative w-full bg-white dark:bg-zinc-900 shadow-sm">
      {/* Capa de Fundo */}
      <div className="h-48 md:h-80 w-full bg-gradient-to-r from-blue-500 to-blue-700 relative">
        <div className="absolute bottom-4 right-4">
          <button className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg flex items-center gap-2 text-sm">
            <Camera size={18} /> Alterar Capa
          </button>
        </div>
      </div>

      {/* Info de Perfil */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="relative -mt-12 md:-mt-24 flex flex-col md:flex-row items-center md:items-end gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200">
              <img
                src="/api/placeholder/200/200"
                alt="Avatar Silvio Gibi"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 bg-gray-200 dark:bg-zinc-800 p-2 rounded-full hover:bg-gray-300">
              <Camera size={20} />
            </button>
          </div>

          {/* Nome e Stats */}
          <div className="flex-1 text-center md:text-left mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Silvio Gibi
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 font-medium">
              Bodyboarder & Mentor no Escola Praia Grande
            </p>
          </div>
        </div>

        <hr className="my-4 border-gray-200 dark:border-zinc-800" />
      </div>
    </div>
  );
}
