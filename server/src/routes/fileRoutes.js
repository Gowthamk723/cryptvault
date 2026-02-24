const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/files/upload
// Notice how we chain the middleware: Auth -> Multer -> Controller
router.post(
  '/upload', 
  authMiddleware, 
  fileController.uploadMiddleware, 
  fileController.uploadFile
);

// GET /api/files/list
router.get('/list', authMiddleware, fileController.listFiles);

// GET /api/files/:id
router.get('/:id', authMiddleware, fileController.downloadFile);


module.exports = router;