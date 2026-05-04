// components/ui/SettingsMenu.js

'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Moon, Sun } from 'lucide-react';

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event) => {
      // Fecha o menu se o clique for fora dele
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  const toggleTheme = (e) => {
    // PREVENÇÃO DE BUG: Impede que este clique "vaze" para as divs por baixo dele
    e.stopPropagation();
    e.preventDefault();
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    console.log(theme);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors shadow-sm"
        aria-label="Abrir Configurações"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
              Configurações
            </h3>
          </div>

          <div className="p-2 flex flex-col gap-1">
            <button
              type="button" // Garante que não é confundido com um submit de formulário
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium text-sm">
                <div className="p-2 bg-gray-200 dark:bg-zinc-700 rounded-full text-gray-700 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-zinc-600 transition-colors">
                  {currentTheme === 'dark' ? (
                    <Moon size={18} />
                  ) : (
                    <Sun size={18} />
                  )}
                </div>
                Modo Escuro
              </div>

              <div
                className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${currentTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-600'}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${currentTheme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
            </button>

            <div className="w-full flex items-center justify-between p-3 rounded-lg opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full">
                  <Settings size={18} />
                </div>
                Mais opções em breve
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
