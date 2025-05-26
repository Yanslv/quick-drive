import fs from 'fs';
import path from 'path';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Sala({ initialFiles }) {
  const router = useRouter();
  const slug = router.query.slug;

  const [files, setFiles] = useState(initialFiles);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file || !slug) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('slug', slug);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (data.url) {
        setFiles(prev => [...prev, data.url.split('/').pop()]);
        setMessage('Arquivo enviado com sucesso!');
      } else {
        setMessage('Erro no envio');
      }
    } catch (e) {
      console.error(e);
      setMessage('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Arquivos da sala: {slug}</h1>

      {files.length === 0 ? (
        <p>Nenhum arquivo encontrado.</p>
      ) : (
        <ul>
          {files.map((fileName) => (
            <li key={fileName}>
              <a href={`/uploads/${slug}/${fileName}`} download>
                {fileName}
              </a>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h3>Enviar novo arquivo</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Enviando...' : 'Enviar'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const dir = path.join(process.cwd(), 'public', 'uploads', slug);
  let initialFiles = [];

  try {
    if (fs.existsSync(dir)) {
      initialFiles = fs.readdirSync(dir);
    }
  } catch (e) {
    initialFiles = [];
  }

  return {
    props: {
      initialFiles: initialFiles || [], // redundante mas seguro
    },
  };
}