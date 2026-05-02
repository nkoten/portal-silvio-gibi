// app/perfil/page.js

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Camera, User } from 'lucide-react';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [novaImagemFicheiro, setNovaImagemFicheiro] = useState(null);
  const [imagemPreview, setImagemPreview] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Se não estiver logado, manda para a home
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Carrega os dados atuais da API
  useEffect(() => {
    if (status === 'authenticated') {
      async function carregarDados() {
        try {
          const res = await fetch('/api/perfil');
          if (res.ok) {
            const dados = await res.json();
            setNome(dados.nome || '');
            setBio(dados.bio || '');
            setAvatarUrl(dados.avatarUrl || '');
          }
        } catch (error) {
          console.error('Erro ao carregar perfil', error);
        } finally {
          setCarregando(false);
        }
      }
      carregarDados();
    }
  }, [status]);

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
      setNovaImagemFicheiro(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ texto: '', tipo: '' });

    try {
      let urlFinalAvatar = avatarUrl;

      // Se o utilizador escolheu uma foto nova, fazemos upload para o Cloudinary primeiro
      if (novaImagemFicheiro) {
        setMensagem({ texto: 'A enviar foto...', tipo: 'info' });
        const base64 = await converterParaBase64(novaImagemFicheiro);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagemBase64: base64 }),
        });

        if (!uploadRes.ok) throw new Error('Falha ao enviar a imagem.');
        const uploadData = await uploadRes.json();
        urlFinalAvatar = uploadData.secure_url;
        setAvatarUrl(urlFinalAvatar); // Atualiza o estado com a URL nova
      }

      // Salva os dados no nosso banco (Google Sheets)
      setMensagem({ texto: 'A guardar perfil...', tipo: 'info' });
      const perfilRes = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, bio, avatarUrl: urlFinalAvatar }),
      });

      if (!perfilRes.ok) throw new Error('Falha ao guardar alterações.');

      setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
      setNovaImagemFicheiro(null); // Limpa o ficheiro temporário
      setImagemPreview('');
    } catch (error) {
      setMensagem({ texto: error.message || 'Erro ao guardar.', tipo: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        A carregar...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Voltar ao Portal
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Meu Perfil
          </h1>

          <form onSubmit={handleSalvar} className="flex flex-col gap-6">
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center sm:flex-row gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                  {imagemPreview || avatarUrl ? (
                    <img
                      src={imagemPreview || avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
                {/* Botão de alterar foto por cima do avatar */}
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center sm:text-left text-sm text-gray-500 dark:text-zinc-400">
                <p>Formatos suportados: JPG, PNG.</p>
                <p>Tamanho ideal: 400x400px.</p>
              </div>
            </div>

            {/* Campos de Texto */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sobre mim (Biografia)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                  placeholder="Escreva um pouco sobre a sua ligação com o bodyboard..."
                  className="p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent resize-none"
                ></textarea>
              </div>
            </div>

            {/* Mensagem de Status */}
            {mensagem.texto && (
              <div
                className={`p-3 rounded-md text-sm ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : mensagem.tipo === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
              >
                {mensagem.texto}
              </div>
            )}

            {/* Botão de Salvar */}
            <button
              type="submit"
              disabled={salvando}
              className="mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-md transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {salvando ? (
                'A guardar...'
              ) : (
                <>
                  <Save size={20} /> Guardar Alterações
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
