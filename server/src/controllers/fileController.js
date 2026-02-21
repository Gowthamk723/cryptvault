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