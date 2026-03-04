const Resume = require('../models/Resume');
const { AppError } = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// ==========================================
// @desc    Upload a resume (PDF)
// @route   POST /api/resume/upload
// @access  Private
//
// FLOW:
// 1. Multer middleware saves the file to server/uploads/
// 2. We read the file and extract text using pdf-parse v2
// 3. Save file info + extracted text to MongoDB
// ==========================================
const uploadResume = async (req, res) => {
    // req.file is set by Multer middleware (runs before this controller)
    if (!req.file) {
        throw new AppError('Please upload a PDF file', 400);
    }

    // Step 1: Read the uploaded PDF file from disk
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Step 2: Extract text content from the PDF using pdf-parse v2
    let extractedText = '';
    try {
        // pdf-parse v2 API: create parser with { data: buffer }
        const parser = new PDFParse({ data: fileBuffer });
        const pdfData = await parser.getText();
        extractedText = pdfData.text || '';
        await parser.destroy(); // Free memory
    } catch (err) {
        console.error('PDF parsing error:', err.message);
        // Even if parsing fails, we still save the file
        extractedText = '';
    }

    // Step 3: Save resume record to MongoDB
    const resume = await Resume.create({
        user: req.user.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        extractedText: extractedText,
    });

    // Warn if text extraction was poor
    const textLength = extractedText.trim().length;
    let message = 'Resume uploaded successfully!';
    if (textLength < 50) {
        message = 'Resume uploaded, but text extraction failed. Your PDF may be scanned/image-based. AI analysis may not work properly.';
    }

    console.log(`Resume uploaded: ${req.file.originalname} | Extracted text: ${textLength} chars`);

    res.status(201).json({
        success: true,
        message,
        resume: {
            id: resume._id,
            fileName: resume.originalName,
            fileSize: resume.fileSize,
            extractedTextLength: textLength,
            extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
            isAnalyzed: resume.isAnalyzed,
            createdAt: resume.createdAt,
        },
    });
};

// ==========================================
// @desc    Get all resumes for logged-in user
// @route   GET /api/resume
// @access  Private
//
// Returns a list of all resumes the user has uploaded,
// sorted by newest first. Excludes the full extractedText
// to keep the response small.
// ==========================================
const getResumes = async (req, res) => {
    const resumes = await Resume.find({ user: req.user.id })
        .select('-extractedText')   // Exclude large text field from list
        .sort({ createdAt: -1 });   // Newest first

    res.status(200).json({
        success: true,
        count: resumes.length,
        resumes,
    });
};

// ==========================================
// @desc    Get single resume with full details
// @route   GET /api/resume/:id
// @access  Private
//
// Returns complete resume data including extractedText
// and AI analysis (if done)
// ==========================================
const getResumeById = async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user.id,  // Ensure user can only see their own resumes
    });

    if (!resume) {
        throw new AppError('Resume not found', 404);
    }

    res.status(200).json({
        success: true,
        resume,
    });
};

// ==========================================
// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
//
// Deletes both:
// 1. The file from server/uploads/
// 2. The database record from MongoDB
// ==========================================
const deleteResume = async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!resume) {
        throw new AppError('Resume not found', 404);
    }

    // Delete the physical file from uploads folder
    try {
        if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
            // unlinkSync = synchronously delete a file
        }
    } catch (err) {
        console.error('File deletion error:', err.message);
        // Continue even if file deletion fails
    }

    // Delete the database record
    await Resume.findByIdAndDelete(resume._id);

    res.status(200).json({
        success: true,
        message: 'Resume deleted successfully!',
    });
};

module.exports = {
    uploadResume,
    getResumes,
    getResumeById,
    deleteResume,
};
