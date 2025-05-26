import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm();
  const uploadsDir = path.join(process.cwd(), '/public/uploads');
  form.uploadDir = uploadsDir;
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug || 'default';
    const dir = path.join(uploadsDir, slug);
    fs.mkdirSync(dir, { recursive: true });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file?.originalFilename || !file?.filepath) {
      return res.status(400).json({ error: 'Arquivo inválido' });
    }

    const newPath = path.join(dir, file.originalFilename);
    fs.renameSync(file.filepath, newPath);

    res.status(200).json({ url: `/uploads/${slug}/${file.originalFilename}` });
  });
}
