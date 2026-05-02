// lib/googleSheets.js

import { google } from 'googleapis';

/**
 * Função responsável por criar e retornar uma conexão autenticada com o Google Sheets.
 * Usamos as variáveis de ambiente (.env.local) para não expor as tuas chaves no código.
 */
export async function getGoogleSheetsConnection() {
  try {
    // 1. Configurar a autenticação usando as tuas credenciais
    // Nota: O método replace(/\\n/g, '\n') é crucial porque o Next.js às vezes
    // desconfigura as quebras de linha da chave privada no arquivo .env
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      // Definimos que queremos ler e escrever planilhas
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 2. Aguardar o cliente ser autenticado
    const client = await auth.getClient();

    // 3. Inicializar a API do Google Sheets com a nossa autenticação
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    // Retornamos a instância pronta para ser usada e o ID da planilha
    return {
      googleSheets,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    };
  } catch (error) {
    console.error('Erro ao conectar com o Google Sheets:', error);
    throw new Error('Falha na conexão com o banco de dados.');
  }
}
