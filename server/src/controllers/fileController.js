const { minioClient } = require('../config/minio');
const pool = require('../config/db');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure Multer to hold the uploaded file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to catch a single file named 'encryptedFile'
exports.uploadMiddleware = upload.single('encryptedFile');

exports.uploadFile = async (req, res) => {
  const userId = req.user.userId; // Comes from our authMiddleware!
  const file = req.file; // The actual file blob

  // All this metadata comes from the frontend
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
    // 1. Create a random unique ID for MinIO storage
    const storageKey = uuidv4();

    // 2. Send the file blob to MinIO bucket
    await minioClient.putObject(
      process.env.MINIO_BUCKET,
      storageKey,
      file.buffer,
      file.size
    );

    // 3. Save the file metadata to PostgreSQL
    const newFile = await pool.query(
      `INSERT INTO files 
      (user_id, file_name_encrypted, file_size, mime_type, storage_key, encryption_iv, file_key_encrypted) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, fileNameEncrypted, file.size, mimeType, storageKey, encryptionIv, fileKeyEncrypted]
    );

    const fileId = newFile.rows[0].id;

    // 4. Save the blind index hash so the user can search for this file later
    await pool.query(
      `INSERT INTO blind_indexes (user_id, file_id, blind_index_hash) VALUES ($1, $2, $3)`,
      [userId, fileId, blindIndexHash]
    );

    res.status(201).json({ message: 'File securely vaulted!', fileId });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to vault file' });
  }
};

// DOWNLOAD FILE
exports.downloadFile = async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.userId; // From authMiddleware

  try {
    // 1. Check if the file exists and belongs to the user
    const query = 'SELECT * FROM files WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [fileId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    const file = result.rows[0];

    // 2. Get the file stream from MinIO
    // We use the 'storage_key' (UUID) to find it in the bucket
    const dataStream = await minioClient.getObject(process.env.MINIO_BUCKET, file.storage_key);

    // 3. Set the Headers
    // The frontend needs these custom headers to decrypt the file later!
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('x-file-name', file.file_name_encrypted);
    res.setHeader('x-encryption-iv', file.encryption_iv);
    res.setHeader('x-file-key', file.file_key_encrypted);

    // 4. Pipe the stream directly to the response
    dataStream.pipe(res);

  } catch (err) {
    console.error('Download Error:', err);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
};

// LIST ALL FILES
exports.listFiles = async (req, res) => {
  const userId = req.user.userId;

  try {
    // We only select metadata, not the secrets
    const query = 'SELECT id, file_name_encrypted, file_size, mime_type, created_at FROM files WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};