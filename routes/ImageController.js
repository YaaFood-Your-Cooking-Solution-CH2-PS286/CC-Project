const express = require('express');
const multer = require('multer');
const userController = require('../controller/ImageController');
const verifyToken = require('../middleware/VerifyToken');

// const router = express.Router();
// const multerMiddleware = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// router.post('/upload',verifyToken, multerMiddleware.single('file'), userController.uploadImage);

// module.exports = router;