import { IncomingForm } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export const config = {
  api: { bodyParser: false },
};

// Configuração do MinIO (ajuste conforme necessário)
const s3 = new S3Client({
  endpoint: 'http://localhost:9000', // ou URL do seu servidor MinIO
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'quickdrive',
    secretAccessKey: 'quick123123',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = 'quick';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug || 'default';
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file?.originalFilename || !file?.filepath) {
      return res.status(400).json({ error: 'Arquivo inválido' });
    }

    const fileStream = fs.createReadStream(file.filepath);
    const contentType = mime.lookup(file.originalFilename) || 'application/octet-stream';
    const key = `${slug}/${file.originalFilename}`;

    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
      }));

      const url = `http://localhost:9000/${BUCKET_NAME}/${key}`;
      res.status(200).json({ url });
    } catch (uploadErr) {
      res.status(500).json({ error: uploadErr.message });
    } finally {
      fs.unlink(file.filepath, () => {}); // Limpa o arquivo temporário
    }
  });
}



// import { IncomingForm } from 'formidable';
// import fs from 'fs';
// import path from 'path';

// export const config = {
//   api: { bodyParser: false },
// };

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const form = new IncomingForm();
//   const uploadsDir = path.join(process.cwd(), '/public/uploads');
//   form.uploadDir = uploadsDir;
//   form.keepExtensions = true;

//   form.parse(req, async (err, fields, files) => {
//     if (err) return res.status(500).json({ error: err.message });

//     const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug || 'default';
//     const dir = path.join(uploadsDir, slug);
//     fs.mkdirSync(dir, { recursive: true });

//     const file = Array.isArray(files.file) ? files.file[0] : files.file;

//     if (!file?.originalFilename || !file?.filepath) {
//       return res.status(400).json({ error: 'Arquivo inválido' });
//     }

//     const newPath = path.join(dir, file.originalFilename);
//     fs.renameSync(file.filepath, newPath);

//     res.status(200).json({ url: `/uploads/${slug}/${file.originalFilename}` });
//   });
// }
