# HireGenie — Backend

Node.js + Express.js backend API for the HireGenie platform.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run server
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run server` | Start with nodemon (dev) |
| `npm start` | Start production server |

## Structure

```
server/
├── config/
│   ├── db.js               # MongoDB connection
│   └── gemini.js           # Gemini AI client
├── controllers/
│   ├── aiController.js     # AI endpoints
│   ├── authController.js   # Auth (login/register)
│   ├── interviewController.js  # Interview CRUD
│   ├── reportController.js # Dashboard aggregation
│   └── resumeController.js # Resume upload & analysis
├── middleware/
│   ├── auth.js             # JWT verification
│   ├── errorHandler.js     # Global error handler
│   ├── rateLimiter.js      # API rate limiting
│   └── upload.js           # Multer file upload
├── models/
│   ├── Interview.js        # Interview schema
│   ├── Report.js           # Report schema
│   ├── Resume.js           # Resume schema
│   └── User.js             # User schema
├── routes/
│   ├── aiRoutes.js
│   ├── authRoutes.js
│   ├── interviewRoutes.js
│   ├── reportRoutes.js
│   └── resumeRoutes.js
├── services/
│   ├── aiService.js        # Gemini AI integration
│   └── interviewService.js # Interview logic
├── uploads/                # Uploaded PDFs (gitignored)
├── utils/
│   ├── helpers.js          # Utility functions
│   └── validators.js       # Input validation
├── .env.example            # Environment template
├── package.json
└── server.js               # Entry point
```

## API Routes

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Resume
- `POST /api/resume/upload` — Upload PDF
- `POST /api/resume/:id/analyze` — AI analysis
- `GET /api/resume` — List all

### Interview
- `POST /api/interview/start` — Start interview
- `POST /api/interview/:id/answer/:qId` — Submit answer
- `GET /api/interview` — List all
- `GET /api/interview/:id` — Get details

### Reports
- `GET /api/report/dashboard` — Dashboard report
