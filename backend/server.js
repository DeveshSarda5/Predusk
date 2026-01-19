const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const dbPath = path.join(__dirname, 'profile.db');

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/profile', async (req, res) => {
  try {
    const profile = await dbGet('SELECT * FROM profile LIMIT 1');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const education = await dbAll('SELECT * FROM education WHERE profile_id = ?', [profile.id]);
    const skills = await dbAll('SELECT skill FROM skills WHERE profile_id = ? ORDER BY proficiency DESC', [profile.id]);
    const projects = await dbAll('SELECT * FROM projects WHERE profile_id = ? ORDER BY created_at DESC', [profile.id]);
    const work = await dbAll('SELECT * FROM work WHERE profile_id = ? ORDER BY start_date DESC', [profile.id]);
    const links = await dbGet('SELECT * FROM links WHERE profile_id = ?', [profile.id]);

    res.json({
      ...profile,
      education,
      skills: skills.map(s => s.skill),
      projects,
      work,
      links: links || {}
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/profile', async (req, res) => {
  try {
    const { name, email, bio, education, skills, projects, work, links } = req.body;

    const existingProfile = await dbGet('SELECT id FROM profile LIMIT 1');
    const profileId = existingProfile ? existingProfile.id : 1;

    if (existingProfile) {
      await dbRun(
        'UPDATE profile SET name = ?, email = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, bio, profileId]
      );
    } else {
      await dbRun(
        'INSERT INTO profile (id, name, email, bio) VALUES (?, ?, ?, ?)',
        [profileId, name, email, bio]
      );
    }

    await dbRun('DELETE FROM education WHERE profile_id = ?', [profileId]);
    if (education && Array.isArray(education)) {
      for (const edu of education) {
        await dbRun(
          'INSERT INTO education (profile_id, school, degree, field, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
          [profileId, edu.school, edu.degree, edu.field, edu.start_date, edu.end_date]
        );
      }
    }

    await dbRun('DELETE FROM skills WHERE profile_id = ?', [profileId]);
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        await dbRun(
          'INSERT INTO skills (profile_id, skill, proficiency) VALUES (?, ?, ?)',
          [profileId, skill.skill || skill, skill.proficiency || 5]
        );
      }
    }

    await dbRun('DELETE FROM projects WHERE profile_id = ?', [profileId]);
    if (projects && Array.isArray(projects)) {
      for (const proj of projects) {
        await dbRun(
          'INSERT INTO projects (profile_id, title, description, links) VALUES (?, ?, ?, ?)',
          [profileId, proj.title, proj.description, JSON.stringify(proj.links || [])]
        );
      }
    }

    await dbRun('DELETE FROM work WHERE profile_id = ?', [profileId]);
    if (work && Array.isArray(work)) {
      for (const job of work) {
        await dbRun(
          'INSERT INTO work (profile_id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
          [profileId, job.company, job.position, job.start_date, job.end_date, job.description]
        );
      }
    }

    if (links) {
      const existingLinks = await dbGet('SELECT id FROM links WHERE profile_id = ?', [profileId]);
      if (existingLinks) {
        await dbRun(
          'UPDATE links SET github = ?, linkedin = ?, portfolio = ?, resume = ? WHERE profile_id = ?',
          [links.github, links.linkedin, links.portfolio, links.resume, profileId]
        );
      } else {
        await dbRun(
          'INSERT INTO links (profile_id, github, linkedin, portfolio, resume) VALUES (?, ?, ?, ?, ?)',
          [profileId, links.github, links.linkedin, links.portfolio, links.resume]
        );
      }
    }

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const { skill } = req.query;
    let query = 'SELECT * FROM projects WHERE profile_id = 1';
    const params = [];

    if (skill) {
      query = `SELECT DISTINCT projects.* FROM projects 
               WHERE projects.profile_id = 1 
               AND projects.id IN (
                 SELECT DISTINCT project_id FROM project_skills WHERE skill = ?
               )`;
      params.push(skill);
    }

    query += ' ORDER BY created_at DESC';
    const projects = await dbAll(query, params);
    
    const projectsWithLinks = projects.map(p => ({
      ...p,
      links: p.links ? JSON.parse(p.links) : []
    }));

    res.json(projectsWithLinks);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/skills/top', async (req, res) => {
  try {
    const skills = await dbAll(
      'SELECT skill, proficiency FROM skills WHERE profile_id = 1 ORDER BY proficiency DESC LIMIT 10',
      []
    );
    res.json(skills);
  } catch (error) {
    console.error('Error fetching top skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }

    const searchTerm = `%${q}%`;
    const results = {
      projects: await dbAll(
        'SELECT title, description FROM projects WHERE profile_id = 1 AND (title LIKE ? OR description LIKE ?) LIMIT 5',
        [searchTerm, searchTerm]
      ),
      skills: await dbAll(
        'SELECT DISTINCT skill FROM skills WHERE profile_id = 1 AND skill LIKE ? LIMIT 5',
        [searchTerm]
      ),
      education: await dbAll(
        'SELECT school, degree, field FROM education WHERE profile_id = 1 AND (school LIKE ? OR degree LIKE ? OR field LIKE ?) LIMIT 5',
        [searchTerm, searchTerm, searchTerm]
      )
    };

    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
      console.log('Database closed');
      process.exit(0);
    });
  }, 100);
});
