// lib/db.js

import { getGoogleSheetsConnection } from './googleSheets';

/**
 * Função interna para obter e incrementar o próximo ID de uma tabela usando a aba _meta.
 * Isso garante que nossos IDs sejam únicos, como em um banco SQL real.
 */
async function getNextId(tableName) {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  // 1. Lemos a aba _meta
  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range: '_meta!A2:B10',
  });

  const rows = response.data.values;
  let rowIndex = -1;
  let lastId = 0;

  // 2. Procuramos a tabela desejada (Posts, Usuarios ou Mensagens)
  if (rows) {
    rowIndex = rows.findIndex((row) => row[0] === tableName);
    if (rowIndex !== -1) {
      lastId = parseInt(rows[rowIndex][1] || '0', 10);
    }
  }

  if (rowIndex === -1)
    throw new Error(`Tabela ${tableName} não encontrada na aba _meta.`);

  // 3. Incrementamos o ID
  const newId = lastId + 1;

  // 4. Atualizamos o novo ID na planilha _meta (rowIndex + 2 por causa do cabeçalho)
  await googleSheets.spreadsheets.values.update({
    spreadsheetId,
    range: `_meta!B${rowIndex + 2}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newId]],
    },
  });

  return newId;
}

/**
 * Função para adicionar um novo Post no banco.
 * @param {Object} postData - Dados do post (titulo, conteudo, imagemUrl)
 */
export async function createPost(postData) {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  // Pegamos o ID seguro
  const newId = await getNextId('Posts');
  const dataAtual = new Date().toISOString();

  // Inserimos a nova linha na aba Posts
  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Posts!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          newId,
          postData.titulo,
          postData.conteudo,
          postData.imagemUrl || '',
          dataAtual,
        ],
      ],
    },
  });

  return { success: true, id: newId };
}

/**
 * Função para buscar todos os Posts.
 */
export async function getAllPosts() {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Posts!A2:E', // Ignora o cabeçalho
  });

  const rows = response.data.values || [];

  // Mapeamos os arrays que voltam do Google Sheets para Objetos JavaScript limpos
  return rows
    .map((row) => ({
      id: row[0],
      titulo: row[1],
      conteudo: row[2],
      imagemUrl: row[3],
      data: row[4],
    }))
    .reverse(); // Reverse para o post mais novo aparecer primeiro
}

/**
 * Função para registar um novo utilizador/visitante.
 */
export async function createUsuario(userData) {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  const newId = await getNextId('Usuarios');
  const dataAtual = new Date().toISOString();

  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Usuarios!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          newId,
          userData.nome,
          userData.email,
          'visitante', // A role default
          dataAtual,
        ],
      ],
    },
  });

  return { success: true, id: newId, nome: userData.nome, role: 'visitante' };
}

/**
 * Função para adicionar uma nova mensagem ao histórico.
 */
export async function createMensagem(mensagemData) {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  const newId = await getNextId('Mensagens');
  const dataAtual = new Date().toISOString();

  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Mensagens!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [newId, mensagemData.remetenteNome, mensagemData.mensagem, dataAtual],
      ],
    },
  });

  return { success: true, id: newId, dataHora: dataAtual };
}

/**
 * Função para buscar o histórico de mensagens.
 */
export async function getHistoricoMensagens() {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Mensagens!A2:D',
  });

  const rows = response.data.values || [];

  return rows.map((row) => ({
    id: row[0],
    remetenteNome: row[1],
    mensagem: row[2],
    dataHora: row[3],
  }));
  // Sem reverse aqui, pois no chat queremos a ordem cronológica normal (mais antigas em cima)
}

/**
 * Função para buscar um utilizador pelo Email.
 * Usada no processo de login para saber se o visitante já está registado.
 */
export async function getUsuarioByEmail(email) {
  try {
    const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:I',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return null;

    const userRow = rows.find((row) => row[2] === email);
    if (!userRow) return null;

    return {
      id: String(userRow[0] || ''),
      nome: String(userRow[1] || ''),
      email: String(userRow[2] || ''),
      role: String(userRow[3] || 'visitante'),
      dataRegistro: String(userRow[4] || ''),
      bio: String(userRow[5] || ''),
      avatarUrl: String(userRow[6] || ''),
      capaUrl: String(userRow[7] || ''), // NOVO
      telefone: String(userRow[8] || ''), // NOVO
    };
  } catch (error) {
    console.error('Erro ao ler Usuarios do Sheets:', error);
    return null;
  }
}

/**
 * Função NOVA para atualizar os dados de um utilizador existente.
 */
export async function updateUsuario(emailAntigo, dadosAtualizados) {
  try {
    const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:I',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[2] === emailAntigo);

    if (rowIndex === -1) {
      throw new Error(`O e-mail '${emailAntigo}' não foi encontrado.`);
    }

    const numeroDaLinha = rowIndex + 1;

    // Atualizamos Nome e o (Novo) Email
    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!B${numeroDaLinha}:C${numeroDaLinha}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[dadosAtualizados.nome || '', dadosAtualizados.email || '']],
      },
    });

    // Atualizamos Bio, Avatar, Capa e Telefone (Colunas F até I)
    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!F${numeroDaLinha}:I${numeroDaLinha}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            dadosAtualizados.bio || '',
            dadosAtualizados.avatarUrl || '',
            dadosAtualizados.capaUrl || '',
            dadosAtualizados.telefone || '',
          ],
        ],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro no updateUsuario:', error);
    throw error;
  }
}

/**
 * Função para gravar um novo comentário no banco de dados.
 * O comentário fica amarrado a um Post específico através do postId.
 */
export async function createComentario(comentarioData) {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  const newId = await getNextId('Comentarios');
  const dataAtual = new Date().toISOString();

  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Comentarios!A:F', // Expandido até F
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          newId,
          comentarioData.postId,
          comentarioData.autorNome,
          comentarioData.texto,
          dataAtual,
          comentarioData.avatarUrl || '', // Grava o link do avatar
        ],
      ],
    },
  });

  return {
    success: true,
    id: newId,
    dataHora: dataAtual,
    avatarUrl: comentarioData.avatarUrl,
  };
}

/**
 * Função para buscar todos os comentários que pertencem a um Post específico.
 */
export async function getComentariosPorPost(postId) {
  const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();

  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Comentarios!A2:F', // Lemos até a coluna F
  });

  const rows = response.data.values || [];
  const comentariosDoPost = rows.filter((row) => row[1] == postId);

  return comentariosDoPost.map((row) => ({
    id: row[0],
    postId: row[1],
    autorNome: row[2],
    texto: row[3],
    dataHora: row[4],
    avatarUrl: row[5] || '', // Retorna o link do avatar para a tela
  }));
}

/**
 * Função NOVA para buscar o perfil do Administrador (Silvio) para a página principal.
 */
export async function getAdminProfile() {
  try {
    const { googleSheets, spreadsheetId } = await getGoogleSheetsConnection();
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:I', // Expandido até I
    });
    const rows = response.data.values || [];
    const adminRow = rows.find((row) => row[3] === 'admin');

    if (adminRow) {
      return {
        nome: String(adminRow[1] || 'Silvio Gibi'),
        bio: String(adminRow[5] || 'Bodyboarder & Mentor'),
        avatarUrl: String(adminRow[6] || ''),
        capaUrl: String(adminRow[7] || ''), // NOVO
        telefone: String(adminRow[8] || ''), // NOVO
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil do admin:', error);
    return null;
  }
}
