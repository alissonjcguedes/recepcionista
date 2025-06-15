import { OpenAI } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send('Erro no upload');

    const audioPath = files.audio.filepath;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1'
    });

    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Você é uma recepcionista de restaurante simpática de Minas Gerais. Sugira feijoada com farofa, couve e laranja como prato do dia.' },
        { role: 'user', content: transcription.text }
      ]
    });

    res.status(200).json({ transcript: chat.choices[0].message.content });
  });
}
