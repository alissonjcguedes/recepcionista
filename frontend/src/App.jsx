import React, { useState } from 'react';

export default function App() {
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState('');

  const handleClick = async () => {
    setListening(true);
    const audioBlob = await recordAudio(5); // grava 5 segundos
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    const res = await fetch('/api/chat', { method: 'POST', body: formData });
    const data = await res.json();
    setResponse(data.transcript);
    setListening(false);
  };

  const recordAudio = (seconds = 5) => new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), seconds * 1000);
    });
  });

  return (
    <main>
      <h1>Recepcionista IA</h1>
      <button onClick={handleClick} disabled={listening}>
        {listening ? 'Ouvindo...' : 'Falar com a recepcionista'}
      </button>
      <p>{response}</p>
    </main>
  );
}
