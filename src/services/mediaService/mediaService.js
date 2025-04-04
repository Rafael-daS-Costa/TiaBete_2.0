const { saveMedia } = require('../../utils/fileSaver');
const { getAudioTranscription } = require('../deepgramService/deepgramService');
const {
  getMediaUrl,
  downloadMedia,
} = require('../facebookService/facebookService');
const path = require('path');
const fs = require('fs');

function ensureDirectoryExistence(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function getFileAndTranscribe(mediaId) {
  try {
    console.log('getFileAndTranscribe start');
    // obtém informações do arquivo do facebook
    const mediaInfo = await getMediaUrl(mediaId);

    // faz download do arquivo do facebook
    const mediaFile = await downloadMedia(mediaInfo.url);

    console.log('Buffer size before saving:', mediaFile.length);

    // define o caminho do arquivo, utilizando /tmp para evitar problemas no Render
    const filePath = path.resolve('/tmp', `file-${mediaId}.ogg`);

    console.log('filePath: ', filePath);

    // garante que a pasta existe
    ensureDirectoryExistence(filePath);

    // salva o arquivo
    saveMedia(filePath, mediaFile);
    console.log(`File saved in: ${filePath}`);

    // verifica se o arquivo foi realmente salvo
    if (!fs.existsSync(filePath)) {
      throw new Error(`Error: file not correctly saved in ${filePath}`);
    }

    // transcrição do arquivo de áudio
    const transcription = await getAudioTranscription(filePath);

    console.log('getFileAndTranscribe end');
    return transcription;
  } catch (e) {
    throw new Error('Error getting and transcribing audio: ' + e.message);
  }
}

module.exports = { getFileAndTranscribe };
