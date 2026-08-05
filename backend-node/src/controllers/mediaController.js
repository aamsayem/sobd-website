const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MediaFile = require("../models/MediaFile");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../../media");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 12 * 1024 * 1024 },
});

async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const relativePath = `/media/${req.file.filename}`;

    const mediaFile = new MediaFile({
      original_file_name: req.file.originalname,
      stored_file_name: req.file.filename,
      file_type: req.file.mimetype,
      mime_type: req.file.mimetype,
      size: req.file.size,
      file_path: relativePath,
      status: "published",
      is_active: true,
      uploaded_by: req.user ? req.user._id : null,
    });

    await mediaFile.save();

    const obj = mediaFile.toObject();
    obj.id = obj._id.toString();
    obj.url = relativePath;

    res.status(201).json(obj);
  } catch (error) {
    next(error);
  }
}

async function listFiles(req, res, next) {
  try {
    const filter = { is_active: true };
    if (req.query.path) {
      filter.$or = [
        { file_path: req.query.path },
        { stored_file_name: req.query.path }
      ];
    }

    const totalCount = await MediaFile.countDocuments(filter);

    let query = MediaFile.find(filter);
    if (req.query.page && req.query.page_size) {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const pageSize = Math.max(1, parseInt(req.query.page_size) || 10);
      query = query.skip((page - 1) * pageSize).limit(pageSize);
    } else if (req.query.page_size) {
      const pageSize = Math.max(1, parseInt(req.query.page_size) || 10);
      query = query.limit(pageSize);
    }

    const files = await query;
    const formatted = files.map(file => {
      const obj = file.toObject();
      obj.id = obj._id.toString();
      obj.url = obj.file_path;
      return obj;
    });

    if (req.query.page_size || req.query.page) {
      return res.json({
        count: totalCount,
        results: formatted,
      });
    }

    res.json(formatted);
  } catch (error) {
    next(error);
  }
}

async function deleteFile(req, res, next) {
  try {
    const { id } = req.params;
    const mediaFile = await MediaFile.findById(id);
    if (!mediaFile) {
      return res.status(404).json({ success: false, message: "Media file not found" });
    }

    const physicalPath = path.join(__dirname, "../../", mediaFile.file_path);
    if (fs.existsSync(physicalPath)) {
      try {
        fs.unlinkSync(physicalPath);
      } catch (err) {
        console.warn("Failed to delete physical file:", err.message);
      }
    }

    await MediaFile.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  uploadFile,
  listFiles,
  deleteFile,
};
