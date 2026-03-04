const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    uploadResume,
    getResumes,
    getResumeById,
    deleteResume,
} = require('../controllers/resumeController');

// All resume routes require authentication (protect middleware)

// POST /api/resume/upload
// Middleware chain: protect → multer upload → controller
// upload.single('resume') = expect ONE file with field name "resume"
router.post('/upload', protect, upload.single('resume'), uploadResume);

// GET /api/resume — List all user's resumes
router.get('/', protect, getResumes);

// GET /api/resume/:id — Get one resume with full details
router.get('/:id', protect, getResumeById);

// DELETE /api/resume/:id — Delete a resume
router.delete('/:id', protect, deleteResume);

module.exports = router;
