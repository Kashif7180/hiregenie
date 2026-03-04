import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResumeUpload = () => {
    // ---- State Management ----
    const [resumes, setResumes] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedResume, setSelectedResume] = useState(null);
    const fileInputRef = useRef(null);

    // ---- Fetch all resumes on page load ----
    const fetchResumes = useCallback(async () => {
        try {
            const { data } = await api.get('/resume');
            setResumes(data.resumes);
        } catch (error) {
            toast.error('Failed to load resumes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    // ---- File Upload Handler ----
    const handleUpload = async (file) => {
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed!');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const { data } = await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percent);
                },
            });
            toast.success(data.message);
            fetchResumes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // ---- Drag & Drop Handlers ----
    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleUpload(file);
        e.target.value = '';
    };

    // ---- Delete Resume ----
    const handleDelete = async (resumeId) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await api.delete(`/resume/${resumeId}`);
            toast.success('Resume deleted!');
            setResumes(resumes.filter((r) => r._id !== resumeId));
            if (selectedResume?._id === resumeId) setSelectedResume(null);
        } catch (error) {
            toast.error('Failed to delete resume');
        }
    };

    // ---- View Resume Details ----
    const handleViewResume = async (resumeId) => {
        try {
            const { data } = await api.get(`/resume/${resumeId}`);
            setSelectedResume(data.resume);
        } catch (error) {
            toast.error('Failed to load resume details');
        }
    };

    // ---- AI Analysis ----
    // This sends the resume to Gemini AI for scoring & feedback
    const handleAnalyze = async (resumeId) => {
        setIsAnalyzing(true);
        const loadingToast = toast.loading('🤖 AI is analyzing your resume...');

        try {
            const { data } = await api.post(`/ai/analyze/${resumeId}`);
            toast.dismiss(loadingToast);
            toast.success('Analysis complete! 🎉');

            // Refresh the resume details & list
            handleViewResume(resumeId);
            fetchResumes();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ---- Helpers ----
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    // Color based on score value
    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-info)';
        if (score >= 40) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    return (
        <div className="resume-page">
            <div className="resume-header">
                <h1>Resume <span className="gradient-text">Upload</span></h1>
                <p className="resume-subtitle">
                    Upload your resume to get AI-powered analysis and interview preparation
                </p>
            </div>

            {/* ===== UPLOAD ZONE ===== */}
            <div
                className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload resume"
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" hidden />
                {isUploading ? (
                    <div className="upload-progress">
                        <div className="upload-progress-icon">📤</div>
                        <p className="upload-progress-text">Uploading... {uploadProgress}%</p>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">📄</div>
                        <h3>Drag & Drop your resume here</h3>
                        <p>or click to browse files</p>
                        <span className="upload-hint">PDF only • Max 5MB</span>
                    </>
                )}
            </div>

            {/* ===== RESUME LIST ===== */}
            <div className="resume-list-section">
                <h2>Your Resumes ({resumes.length})</h2>
                {isLoading ? (
                    <div className="resume-loading">
                        <div className="spinner"></div>
                        <p>Loading resumes...</p>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="resume-empty">
                        <p>📭 No resumes uploaded yet</p>
                        <p className="resume-empty-hint">Upload your first resume to get started!</p>
                    </div>
                ) : (
                    <div className="resume-list">
                        {resumes.map((resume) => (
                            <div
                                key={resume._id}
                                className={`resume-card ${selectedResume?._id === resume._id ? 'active' : ''}`}
                            >
                                <div className="resume-card-icon">📄</div>
                                <div className="resume-card-info">
                                    <h4>{resume.originalName}</h4>
                                    <div className="resume-card-meta">
                                        <span>{formatFileSize(resume.fileSize)}</span>
                                        <span>•</span>
                                        <span>{formatDate(resume.createdAt)}</span>
                                        <span>•</span>
                                        <span className={`resume-status ${resume.isAnalyzed ? 'analyzed' : 'pending'}`}>
                                            {resume.isAnalyzed ? '✅ Analyzed' : '⏳ Pending Analysis'}
                                        </span>
                                    </div>
                                </div>
                                <div className="resume-card-actions">
                                    {!resume.isAnalyzed && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleAnalyze(resume._id)}
                                            disabled={isAnalyzing}
                                        >
                                            {isAnalyzing ? '⏳' : '🤖'} Analyze
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleViewResume(resume._id)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{ color: 'var(--color-error)' }}
                                        onClick={() => handleDelete(resume._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== RESUME DETAIL VIEW ===== */}
            {selectedResume && (
                <div className="resume-detail">
                    <div className="resume-detail-header">
                        <h2>📄 {selectedResume.originalName}</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!selectedResume.isAnalyzed && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleAnalyze(selectedResume._id)}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? '⏳ Analyzing...' : '🤖 Analyze with AI'}
                                </button>
                            )}
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setSelectedResume(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* ===== AI ANALYSIS RESULTS ===== */}
                    {selectedResume.isAnalyzed && selectedResume.analysis ? (
                        <div className="analysis-section">
                            {/* Score Cards */}
                            <div className="analysis-scores">
                                <div className="score-card">
                                    <div className="score-value" style={{ color: getScoreColor(selectedResume.analysis.overallScore) }}>
                                        {selectedResume.analysis.overallScore}
                                    </div>
                                    <div className="score-label">Overall Score</div>
                                    <div className="score-bar">
                                        <div className="score-bar-fill" style={{ width: `${selectedResume.analysis.overallScore}%`, background: getScoreColor(selectedResume.analysis.overallScore) }} />
                                    </div>
                                </div>
                                <div className="score-card">
                                    <div className="score-value" style={{ color: getScoreColor(selectedResume.analysis.atsScore) }}>
                                        {selectedResume.analysis.atsScore}
                                    </div>
                                    <div className="score-label">ATS Score</div>
                                    <div className="score-bar">
                                        <div className="score-bar-fill" style={{ width: `${selectedResume.analysis.atsScore}%`, background: getScoreColor(selectedResume.analysis.atsScore) }} />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="analysis-block">
                                <h3>📋 Summary</h3>
                                <p>{selectedResume.analysis.summary}</p>
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div className="analysis-grid">
                                <div className="analysis-block strengths">
                                    <h3>💪 Strengths</h3>
                                    <ul>
                                        {selectedResume.analysis.strengths?.map((s, i) => (
                                            <li key={i}>✅ {s}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="analysis-block weaknesses">
                                    <h3>⚠️ Weaknesses</h3>
                                    <ul>
                                        {selectedResume.analysis.weaknesses?.map((w, i) => (
                                            <li key={i}>❌ {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="analysis-block">
                                <h3>💡 Suggestions to Improve</h3>
                                <ul>
                                    {selectedResume.analysis.suggestions?.map((s, i) => (
                                        <li key={i}>→ {s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Skills */}
                            {selectedResume.parsedSkills?.length > 0 && (
                                <div className="analysis-block">
                                    <h3>🛠️ Detected Skills</h3>
                                    <div className="skills-tags">
                                        {selectedResume.parsedSkills.map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Keywords */}
                            {selectedResume.analysis.keywordAnalysis && (
                                <div className="analysis-grid">
                                    <div className="analysis-block">
                                        <h3>🔑 Present Keywords</h3>
                                        <div className="skills-tags">
                                            {selectedResume.analysis.keywordAnalysis.presentKeywords?.map((k, i) => (
                                                <span key={i} className="skill-tag present">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="analysis-block">
                                        <h3>❓ Missing Keywords</h3>
                                        <div className="skills-tags">
                                            {selectedResume.analysis.keywordAnalysis.missingKeywords?.map((k, i) => (
                                                <span key={i} className="skill-tag missing">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="analysis-pending">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                            <p>Click <strong>&quot;Analyze with AI&quot;</strong> to get your resume scored</p>
                            <p className="analysis-pending-hint">
                                Gemini AI will analyze your skills, score your resume, and suggest improvements.
                            </p>
                        </div>
                    )}

                    {/* Extracted Text Preview */}
                    <div className="extracted-text">
                        <h3>📝 Extracted Text Preview</h3>
                        <pre className="text-preview">
                            {selectedResume.extractedText
                                ? selectedResume.extractedText.substring(0, 2000) +
                                (selectedResume.extractedText.length > 2000 ? '\n\n... (truncated)' : '')
                                : 'No text extracted from this file.'}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeUpload;
