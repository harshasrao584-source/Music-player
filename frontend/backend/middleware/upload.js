import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists (fallback to writeable /tmp on Vercel serverless)
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadDir = isVercel ? '/tmp/uploads' : './uploads';

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.warn(`Warning: Could not create upload directory ${uploadDir}:`, error.message);
  }
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/flac', 'audio/webm'];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|ogg|flac|webm)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed! (mp3, wav, m4a, ogg, flac)'), false);
    }
  } else if (file.fieldname === 'cover' || file.fieldname === 'avatar') {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed! (jpg, jpeg, png, webp)'), false);
    }
  } else {
    cb(new Error('Unexpected file field!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

export default upload;
