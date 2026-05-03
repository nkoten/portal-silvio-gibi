// lib/cache.js

/**
 * Busca dados armazenados localmente no navegador do utilizador.
 */
export function getLocalCache(key) {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Erro ao ler o cache:', e);
        return null;
      }
    }
  }
  return null;
}

/**
 * Salva os dados no navegador do utilizador para carregamento instantâneo.
 */
export function setLocalCache(key, data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
