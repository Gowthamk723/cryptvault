const { minioClient } = require('../config/minio');
const pool = require('../config/db');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });

exports.uploadMiddleware = upload.single('encryptedFile');

exports.uploadFile = async (req, res) => {
  const userId = req.user.userId; 
  const file = req.file; 

  const { 
    fileNameEncrypted, 
    mimeType, 
    encryptionIv, 
    fileKeyEncrypted, 
    blindIndexHash 
  } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {

    const storageKey = uuidv4();

    await minioClient.putObject(
      process.env.MINIO_BUCKET,
      storageKey,
      file.buffer,
      file.size
    );

    const newFile = await pool.query(
      `INSERT INTO files 
      (user_id, file_name_encrypted, file_size, mime_type, storage_key, encryption_iv, file_key_encrypted, blind_index) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [userId, fileNameEncrypted, file.size, mimeType, storageKey, encryptionIv, fileKeyEncrypted, blindIndexHash]
    );

    res.status(201).json({ message: 'File securely vaulted!', fileId: newFile.rows[0].id });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to vault file' });
  }
};

exports.downloadFile = async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.userId; 

  try {
    const query = 'SELECT * FROM files WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [fileId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    const file = result.rows[0];

    const dataStream = await minioClient.getObject(process.env.MINIO_BUCKET, file.storage_key);


    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('x-file-name', file.file_name_encrypted);
    res.setHeader('x-encryption-iv', file.encryption_iv);
    res.setHeader('x-file-key', file.file_key_encrypted);

    dataStream.pipe(res);

  } catch (err) {
    console.error('Download Error:', err);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
};

exports.listFiles = async (req, res) => {
  const userId = req.user.userId;

  try {
 
    const query = 'SELECT id, file_name_encrypted, file_size, mime_type, created_at FROM files WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.deleteFile = async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.userId;

  try {

    const query = 'SELECT * FROM files WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [fileId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];

    await minioClient.removeObject(process.env.MINIO_BUCKET, file.storage_key);

    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);

    res.json({ message: 'File permanently deleted' });

  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};