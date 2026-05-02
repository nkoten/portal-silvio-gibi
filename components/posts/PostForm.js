// components/posts/PostForm.js

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Image as ImageIcon, X } from 'lucide-react';

export default function PostForm({ onPostCreated }) {
  const { data: session } = useSession();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagemFicheiro, setImagemFicheiro] = useState(null);
  const [imagemPreview, setImagemPreview] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Se não for admin, nem sequer renderiza o formulário
  if (session?.user?.role !== 'admin') {
    return null;
  }

  // Função para ler o arquivo do computador e transformá-lo em Base64
  const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.readAsDataURL(file);
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = (erro) => reject(erro);
    });
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemFicheiro(file);
      setImagemPreview(URL.createObjectURL(file)); // Mostra uma prévia rápida
    }
  };

  const removerImagem = () => {
    setImagemFicheiro(null);
    setImagemPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: '', tipo: '' });

    try {
      let imagemUrlFinal = '';

      // 1. Se houver imagem, envia primeiro para o Cloudinary
      if (imagemFicheiro) {
        setMensagem({ texto: 'A enviar imagem...', tipo: 'info' });
        const base64 = await converterParaBase64(imagemFicheiro);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagemBase64: base64 }),
        });

        if (!uploadRes.ok) throw new Error('Falha ao enviar a imagem.');
        const uploadData = await uploadRes.json();
        imagemUrlFinal = uploadData.secure_url;
      }

      // 2. Envia os dados do Post para o nosso Google Sheets
      setMensagem({ texto: 'A gravar publicação...', tipo: 'info' });
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, conteudo, imagemUrl: imagemUrlFinal }),
      });

      if (!postRes.ok) throw new Error('Falha ao gravar publicação.');

      setMensagem({ texto: 'Publicação criada com sucesso!', tipo: 'sucesso' });
      setTitulo('');
      setConteudo('');
      removerImagem();

      if (onPostCreated) onPostCreated();
    } catch (error) {
      setMensagem({
        texto: error.message || 'Erro ao publicar.',
        tipo: 'erro',
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mb-6">
      <h2 className="text-lg font-bold mb-4">Criar Nova Publicação</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Título da publicação"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="No que estás a pensar?"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          required
          rows="3"
          className="p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>

        {/* Prévia da Imagem selecionada */}
        {imagemPreview && (
          <div className="relative w-fit">
            <img
              src={imagemPreview}
              alt="Prévia"
              className="h-32 rounded-md object-cover border dark:border-zinc-700"
            />
            <button
              type="button"
              onClick={removerImagem}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          {/* Botão de Anexar Foto escondendo o input real */}
          <label className="cursor-pointer flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-medium hover:bg-blue-50 dark:hover:bg-zinc-800 p-2 rounded-md transition-colors">
            <ImageIcon size={20} />
            <span>Foto / Imagem</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagemChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={carregando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {carregando ? (
              'A processar...'
            ) : (
              <>
                <Send size={18} /> Publicar
              </>
            )}
          </button>
        </div>

        {mensagem.texto && (
          <div
            className={`mt-2 p-2 text-sm rounded-md ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : mensagem.tipo === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
          >
            {mensagem.texto}
          </div>
        )}
      </form>
    </div>
  );
}
