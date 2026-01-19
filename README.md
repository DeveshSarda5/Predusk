# Candidate Profile Playground

A minimal full-stack application that stores and queries candidate profile information through an API and web interface.

## 🌐 Live Deployment

- **Frontend (Vercel)**: https://predusk2.vercel.app/
- **Backend API (Railway)**: https://predusk-production.up.railway.app/

## � Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- npm or yarn

### Setup Backend

```bash
cd backend
npm install
node init-db.js          # Initialize database and seed data
npm start                # Start server (runs on http://localhost:3001)
```

### Setup Frontend

```bash
cd frontend
npx http-server . --port 8080
# Open http://localhost:8080 in your browser
```

## 📚 Project Information

**Full-Stack Application** with:
- ✅ Express.js backend with 7 REST API endpoints
- ✅ Vanilla HTML/CSS/JavaScript frontend (no frameworks)
- ✅ SQLite database with 7 normalized tables
- ✅ CORS-enabled for cross-origin requests
- ✅ Production deployments on Vercel (frontend) and Railway (backend)

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (HTML/CSS/JS)                │
│        (Profile view, Search, Projects, Skills)         │
└──────────────────────┬──────────────────────────────────┘
                       │ CORS-enabled Fetch requests
                       ▼
┌─────────────────────────────────────────────────────────┐
│               Backend (Node.js/Express)                 │
│  (/profile, /projects, /skills, /search, /health)      │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│             Database (SQLite - profile.db)              │
│  (profile, education, skills, projects, work, links)    │
└─────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Tables

**profile**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- bio (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**education**
- id (INTEGER PRIMARY KEY)
- profile_id (FK to profile)
- school (TEXT)
- degree (TEXT)
- field (TEXT)
- start_date (TEXT)
- end_date (TEXT)

**skills**
- id (INTEGER PRIMARY KEY)
- profile_id (FK to profile)
- skill (TEXT)
- proficiency (INTEGER, 1-10)

**projects**
- id (INTEGER PRIMARY KEY)
- profile_id (FK to profile)
- title (TEXT)
- description (TEXT)
- links (TEXT - JSON array)
- created_at (DATETIME)

**project_skills**
- id (INTEGER PRIMARY KEY)
- project_id (FK to projects)
- skill (TEXT)

**work**
- id (INTEGER PRIMARY KEY)
- profile_id (FK to profile)
- company (TEXT)
- position (TEXT)
- start_date (TEXT)
- end_date (TEXT)
- description (TEXT)

**links**
- id (INTEGER PRIMARY KEY)
- profile_id (FK to profile)
- github (TEXT)
- linkedin (TEXT)
- portfolio (TEXT)
- resume (TEXT)

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 14
- npm or yarn

### Setup Backend

```bash
cd backend
npm install
node init-db.js          # Initialize database and seed data
npm run dev              # Start server (runs on http://localhost:3001)
```

### Setup Frontend

Option 1: Open directly
```bash
cd frontend
# Open index.html in a browser
# or use a simple HTTP server:
npx http-server .
```

Option 2: Configure for deployed API
```bash
# Edit frontend/index.html and change:
const API_URL = localStorage.getItem('apiUrl') || 'http://localhost:3001';
# Or pass ?api=<url> in query string
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
# Response: { "status": "ok", "timestamp": "2024-01-18T..." }
```

### Profile Management
```bash
# Get profile
GET /profile
# Response: { name, email, bio, education[], skills[], projects[], work[], links }

# Update profile
PUT /profile
# Body: { name, email, bio, education[], skills[], projects[], work[], links }
# Response: { success: true, message: "Profile updated" }
```

### Query Endpoints
```bash
# Get projects filtered by skill
GET /projects?skill=python
# Response: [{ id, title, description, links[], ... }]

# Get top skills
GET /skills/top
# Response: [{ skill, proficiency }, ...]

# Search across profile, projects, education, skills
GET /search?q=java
# Response: { projects: [...], skills: [...], education: [...] }
```

## 📝 Sample curl Commands

```bash
# Check API health
curl http://localhost:3001/health

# Get full profile
curl http://localhost:3001/profile

# Get projects with Python
curl "http://localhost:3001/projects?skill=Python"

# Get top skills
curl http://localhost:3001/skills/top

# Search for "JavaScript"
curl "http://localhost:3001/search?q=JavaScript"

# Update profile
curl -X PUT http://localhost:3001/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Developer",
    "email": "jane@example.com",
    "bio": "Full-stack developer",
    "skills": [
      {"skill": "JavaScript", "proficiency": 9},
      {"skill": "Python", "proficiency": 8}
    ]
  }'
```

## 🌍 Deployment

### Deploy Backend to Railway

1. **Create Railway account** at https://railway.app
2. **Create new project** and connect GitHub repo
3. **Add environment variables**:
   ```
   PORT=3001
   NODE_ENV=production
   ```
4. **Deploy**: Railway auto-deploys on git push to main

**Backend URL**: `https://your-project.railway.app` (will be generated)

### Deploy Frontend to Vercel

1. **Create Vercel account** at https://vercel.com
2. **Connect GitHub repo**
3. **Deploy**: Vercel auto-deploys on git push
4. **Update frontend/index.html** with deployed backend URL:
   ```javascript
   const API_URL = 'https://your-backend.railway.app';
   ```

**Frontend URL**: `https://your-project.vercel.app` (will be generated)

### Deploy Backend to Heroku (Alternative)

```bash
heroku login
heroku create <your-app-name>
git push heroku main
```

### Deploy Frontend to GitHub Pages (Alternative)

1. Push to GitHub
2. Go to Settings > Pages > Select main branch
3. Enable GitHub Pages
4. Update `frontend/index.html` to use deployed backend API

### Docker Deployment (Optional)

Create `Dockerfile` in backend:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

Deploy to any Docker-compatible platform (AWS, GCP, Azure, etc.)

### Environment Variables

**Backend (.env)**
```
PORT=3001
NODE_ENV=production
```

**Frontend (update in index.html)**
```javascript
const API_URL = 'https://your-deployed-backend.com';
```

## � Postman Collection

Import `Postman_Collection.json` into Postman for pre-configured requests:
1. Open Postman
2. Click Import → Select `Postman_Collection.json`
3. Update `{{base_url}}` variable to your API URL
4. Run requests

## 📁 Project Structure

```
predusk/
├── backend/
│   ├── server.js           # Express API server
│   ├── init-db.js          # Database initialization & seed
│   ├── test-api.js         # API test script
│   ├── package.json        # Dependencies
│   ├── Procfile            # Heroku deployment
│   ├── .env.example        # Environment variables template
│   └── profile.db          # SQLite database (auto-generated)
├── frontend/
│   ├── index.html          # Complete SPA application
│   ├── package.json        # Frontend metadata
│   ├── README.md           # Frontend docs
│   └── vercel.json         # Vercel config
├── schema.sql              # Database schema documentation
├── Postman_Collection.json # Postman API collection
├── README.md               # This file
├── app.json                # Heroku app config
├── vercel.json             # Vercel backend config
└── .github/
    └── workflows/
        └── ci.yml          # GitHub Actions CI pipeline
```

## 📊 Database Initialization

The seed data includes:
- **Profile**: Alex Developer (sample data)
- **Skills**: JavaScript (9/10), Python (8/10), Node.js (9/10), React (8/10), SQL (8/10), MongoDB (7/10), etc.
- **Projects**: 
  - E-Commerce Platform
  - Task Management App
  - Data Analysis Dashboard
```
- **Education**: State University, B.S. Computer Science (2018-2022)
- **Work Experience**: 2+ entries with companies and positions
- **Links**: GitHub, LinkedIn, Portfolio, Resume URLs

To replace with your own data, edit `backend/init-db.js` before running initialization.

## ✅ Acceptance Criteria

- [x] GET /health returns 200 with status
- [x] GET /profile returns full candidate data
- [x] GET /projects filters by skill correctly
- [x] GET /skills/top returns top 10 skills sorted by proficiency
- [x] GET /search returns filtered results from projects, skills, education
- [x] Frontend displays profile, projects, skills
- [x] Frontend search functionality works
- [x] Frontend skill filter works
- [x] CORS enabled on backend
- [x] Seed data visible via frontend and API

## 🔒 Known Limitations

1. **No Authentication**: Write operations (PUT /profile) are open to anyone. Consider adding basic auth for production.
2. **Single Profile**: Only one profile supported (hardcoded as profile_id=1).
3. **No Pagination**: All results returned at once (can be large).
4. **No Rate Limiting**: No protection against abuse.
5. **No Logging**: Minimal logging for debugging.
6. **SQLite Only**: Not suitable for high concurrency; use PostgreSQL for production.
7. **In-Memory Database**: If hosting resets, data could be lost; use persistent storage.
8. **No Validation**: Limited input validation on PUT requests.
9. **CORS Wide Open**: Configured for all origins; restrict in production.
10. **No Caching**: Every request hits the database.

## 🔧 Development

### Rebuild Database
```bash
cd backend
rm profile.db  # Delete existing database
node init-db.js
```

### Run Tests (Optional)
```bash
cd backend
npm test  # If tests added
```

### Useful Commands
```bash
# View SQLite database
sqlite3 backend/profile.db

# Query schema
sqlite3 backend/profile.db ".schema"

# Export as JSON
sqlite3 backend/profile.db ".mode json" "SELECT * FROM profile;"
```

## 📚 Resume Link

- **Resume**: https://alexdev.portfolio.com/resume.pdf (update in backend/init-db.js)

## 📦 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Hosting**: Railway (backend), Vercel/Netlify (frontend)

## 📄 License

MIT

---

**Quick Links**
- 🔗 Backend API: `http://localhost:3001` (local)
- 🔗 Frontend: `http://localhost:8080` (local)
- 📖 API Docs: See curl commands above
- 🐛 Issues: Report via GitHub issues

