// app/perfil/page.js

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Camera,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { getLocalCache, setLocalCache } from '@/lib/cache';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');
  const [capaUrl, setCapaUrl] = useState('');

  const [novaImagemFicheiro, setNovaImagemFicheiro] = useState(null);
  const [imagemPreview, setImagemPreview] = useState('');

  const [novaCapaFicheiro, setNovaCapaFicheiro] = useState(null);
  const [capaPreview, setCapaPreview] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const cached = getLocalCache('meu_perfil_cache');
      if (cached) preencherCampos(cached);

      async function carregarDados() {
        try {
          const res = await fetch('/api/perfil');
          if (res.ok) {
            const dados = await res.json();
            setLocalCache('meu_perfil_cache', dados);
            preencherCampos(dados);
          }
        } catch (error) {
          console.error('Erro', error);
        } finally {
          setCarregando(false);
        }
      }
      carregarDados();
    }
  }, [status]);

  const preencherCampos = (dados) => {
    setNome(dados.nome || '');
    setEmail(dados.email || '');
    setTelefone(dados.telefone || '');
    setBio(dados.bio || '');
    setAvatarUrl(dados.avatarUrl || '');
    setCapaUrl(dados.capaUrl || '');
  };

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

  const handleCapaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNovaCapaFicheiro(file);
      setCapaPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (ficheiro) => {
    const base64 = await converterParaBase64(ficheiro);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagemBase64: base64 }),
    });
    if (!uploadRes.ok) throw new Error('Falha no upload da imagem.');
    const data = await uploadRes.json();
    return data.secure_url;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ texto: 'A guardar dados...', tipo: 'info' });

    try {
      let urlFinalAvatar = avatarUrl;
      let urlFinalCapa = capaUrl;

      if (novaImagemFicheiro)
        urlFinalAvatar = await handleUpload(novaImagemFicheiro);
      if (novaCapaFicheiro) urlFinalCapa = await handleUpload(novaCapaFicheiro);

      const perfilRes = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          bio,
          avatarUrl: urlFinalAvatar,
          capaUrl: urlFinalCapa,
        }),
      });

      if (!perfilRes.ok) throw new Error('Falha ao guardar.');

      // Atualiza o cache local imediatamente após salvar para não ter de esperar a próxima consulta
      const novoCache = {
        nome,
        email,
        telefone,
        bio,
        avatarUrl: urlFinalAvatar,
        capaUrl: urlFinalCapa,
      };
      setLocalCache('meu_perfil_cache', novoCache);
      if (session?.user?.role === 'admin')
        setLocalCache('admin_profile_cache', novoCache);

      setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
      setNovaImagemFicheiro(null);
      setImagemPreview('');
      setNovaCapaFicheiro(null);
      setCapaPreview('');
    } catch (error) {
      setMensagem({ texto: error.message || 'Erro ao guardar.', tipo: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando || status === 'loading')
    return (
      <div className="min-h-screen flex items-center justify-center">
        A carregar...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={20} /> Voltar ao Portal
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          {/* Prévia da Capa */}
          <div
            className="h-40 w-full bg-gray-200 dark:bg-zinc-800 bg-cover bg-center relative"
            style={{
              backgroundImage:
                capaPreview || capaUrl
                  ? `url(${capaPreview || capaUrl})`
                  : 'none',
            }}
          >
            <label className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm transition">
              <ImageIcon size={18} /> Alterar Capa
              <input
                type="file"
                accept="image/*"
                onChange={handleCapaChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSalvar} className="flex flex-col gap-6">
              <div className="flex flex-col items-center sm:flex-row gap-6 -mt-16 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
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
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagemChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Campos de Texto Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email (Login)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sobre mim
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="3"
                    className="p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 bg-transparent resize-none"
                  ></textarea>
                </div>
              </div>

              {mensagem.texto && (
                <div
                  className={`p-3 rounded-md text-sm ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : mensagem.tipo === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
                >
                  {mensagem.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-md flex justify-center items-center gap-2"
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
    </div>
  );
}
