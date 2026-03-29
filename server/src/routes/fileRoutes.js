const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
  '/upload', 
  authMiddleware, 
  fileController.uploadMiddleware, 
  fileController.uploadFile
);

router.get('/list', authMiddleware, fileController.listFiles);

router.get('/:id', authMiddleware, fileController.downloadFile);

router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;