import fs from 'fs';
import path from 'path';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Sala({ initialFiles = [] }) {
  const router = useRouter();
  const slug = router.query.slug;

  const [files, setFiles] = useState(initialFiles);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !slug) return;

    setUploading(true);
    setMessage('');
    setError('');

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
        const nome = data.url.split('/').pop();
        setFiles((prev) => [...prev, nome]);
        setMessage('✅ Arquivo enviado com sucesso!');
      } else {
        setError('Erro no envio');
      }
    } catch (_) {
      console.log('_:', _)
      setError('Erro ao enviar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📁 Sala: <span className="text-blue-600 break-words">{slug}</span>
        </h1>

        {/* Lista de arquivos */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Arquivos disponíveis
          </h2>
          {files.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum arquivo ainda.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((fileName) => (
                <li
                  key={fileName}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                >
                  <span className="text-gray-700 truncate max-w-[70%]">
                    📎 {fileName}
                  </span>
                  <a
                    href={`/uploads/${slug}/${fileName}`}
                    download
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Baixar
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upload */}
        <section className="bg-gray-50 p-6 rounded-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Enviar novo arquivo
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full sm:w-auto text-sm text-gray-700
                file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700
                hover:file:bg-blue-200"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {uploading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>

          {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}
          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        </section>
      </div>
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
    console.log('e:', e)
    initialFiles = [];
  }

  return {
    props: {
      initialFiles,
    },
  };
}
