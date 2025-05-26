import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Home() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleEnter = () => {
    if (slug.trim()) router.push(`/${slug}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ArquivoPad</h1>
      <input
        placeholder="Nome da sala"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button onClick={handleEnter}>Entrar</button>
    </div>
  );
}
