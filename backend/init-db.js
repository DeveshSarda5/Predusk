const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'profile.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  initializeSchema();
});

function initializeSchema() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS education (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        school TEXT NOT NULL,
        degree TEXT,
        field TEXT,
        start_date TEXT,
        end_date TEXT,
        FOREIGN KEY(profile_id) REFERENCES profile(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        skill TEXT NOT NULL,
        proficiency INTEGER DEFAULT 5,
        FOREIGN KEY(profile_id) REFERENCES profile(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        links TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(profile_id) REFERENCES profile(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS project_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        skill TEXT NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS work (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        FOREIGN KEY(profile_id) REFERENCES profile(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        github TEXT,
        linkedin TEXT,
        portfolio TEXT,
        resume TEXT,
        FOREIGN KEY(profile_id) REFERENCES profile(id)
      )
    `, seedData);
  });
}

function seedData() {
  db.serialize(() => {
    db.run('DELETE FROM profile');
    db.run('DELETE FROM education');
    db.run('DELETE FROM skills');
    db.run('DELETE FROM projects');
    db.run('DELETE FROM project_skills');
    db.run('DELETE FROM work');
    db.run('DELETE FROM links');

    db.run(
      'INSERT INTO profile (id, name, email, bio) VALUES (?, ?, ?, ?)',
      [1, 'Devesh Sarda', 'deveshsarda5@gmail.com', 'B.Tech Student at NIT Delhi specializing in Computer Science. Passionate about Machine Learning, Full-Stack Development, and building intelligent systems.']
    );

    db.run(
      'INSERT INTO education (profile_id, school, degree, field, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'National Institute of Technology Delhi', 'B.Tech', 'Computer Science and Engineering', '2023', 'May 2027']
    );

    db.run(
      'INSERT INTO education (profile_id, school, degree, field, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'Cambridge Court World School (CBSE)', 'Class XII', 'Science Stream', '2022', '2023']
    );

    const skills = [
      { skill: 'Machine Learning', proficiency: 9 },
      { skill: 'Python', proficiency: 9 },
      { skill: 'React.js', proficiency: 8 },
      { skill: 'Node.js', proficiency: 8 },
      { skill: 'Express', proficiency: 8 },
      { skill: 'MySQL', proficiency: 8 },
      { skill: 'PyTorch', proficiency: 8 },
      { skill: 'Scikit-learn', proficiency: 8 },
      { skill: 'XGBoost', proficiency: 8 },
      { skill: 'Pandas', proficiency: 8 },
      { skill: 'REST APIs', proficiency: 8 },
      { skill: 'Tailwind CSS', proficiency: 7 },
      { skill: 'Chart.js', proficiency: 7 },
      { skill: 'EfficientNet', proficiency: 7 },
      { skill: 'OpenCV', proficiency: 7 },
      { skill: 'GridSearchCV', proficiency: 7 },
      { skill: 'Gradio', proficiency: 6 }
    ];

    skills.forEach(s => {
      db.run(
        'INSERT INTO skills (profile_id, skill, proficiency) VALUES (?, ?, ?)',
        [1, s.skill, s.proficiency]
      );
    });

    db.run(
      'INSERT INTO projects (profile_id, title, description, links) VALUES (?, ?, ?, ?)',
      [1, 'Healthcare Insurance Fraud Detection', '◦Built ML models to classify fraudulent insurance claims with 92% accuracy◦Processed 550K+ claim records via encoding, scaling, outlier removal, and cleaning◦Improved model performance by 20% using GridSearchCV across 120+ hyperparameter combinations and evaluated results using precision, recall, F1, and confusion matrix', JSON.stringify(['https://github.com/DeveshSarda5/MediCare_Fraud_Detection/tree/main/MediCare_Fraud_Detection'])]
    );

    db.run(
      'INSERT INTO projects (profile_id, title, description, links) VALUES (?, ?, ?, ?)',
      [1, 'Personal Finance Dashboard', '◦Developed an intelligent finance tracker that predicts budgets with 86% accuracy◦Engineered responsive UI using React.js + Tailwind CSS and scalable REST APIs using Node.js & Express, handling 10,000+ requests/day during testing◦Designed Chart.js analytics reducing manual budgeting by 60% and optimized MySQL queries to boost load speed by 40%', JSON.stringify(['https://github.com/DeveshSarda5/Finance_Tracker'])]
    );

    db.run(
      'INSERT INTO projects (profile_id, title, description, links) VALUES (?, ?, ?, ?)',
      [1, 'TrashScan: Smart Waste Classifier', '◦Created a waste classification system using a frozen EfficientNet-B3 backbone and a custom classifier◦Used augmentation, weighted sampling, Adam optimizer trained over a dataset with 15,000+ images◦Evaluated using Accuracy, F1, Precision, Recall, and confusion matrix, achieving 95% accuracy across 12 categories', JSON.stringify(['https://github.com/ishikakanyal/TrashScan-Smart-Waste-Classifier'])]
    );

    db.run('INSERT INTO project_skills (project_id, skill) VALUES (1, "Python")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (1, "Scikit-learn")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (1, "XGBoost")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (1, "Pandas")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (1, "GridSearchCV")');
    
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (2, "React.js")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (2, "Node.js")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (2, "Express")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (2, "MySQL")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (2, "Chart.js")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (2, "Tailwind CSS")');
    
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (3, "Python")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (3, "PyTorch")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (3, "EfficientNet")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (3, "OpenCV")');
    db.run('INSERT INTO project_skills (project_id, skill) VALUES (3, "Gradio")');

    db.run(
      'INSERT INTO work (profile_id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'NIT Delhi', 'Training and Placement Cell', '', '', 'Coordinated with industry professionals with a diverse team of 120 people◦Managed outreach initiatives improving employer engagement and recruitment participation by 25%']
    );

    db.run(
      'INSERT INTO work (profile_id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'NIT Delhi', 'Google Developer Student Club', '', '', 'Organized and executed 15+ technical events, hands-on workshops and community initiatives◦Supported peer learning and improved campus-wide technical engagement◦Contributed to growth of innovation-driven developer culture within the institution']
    );

    db.run(
      'INSERT INTO links (profile_id, github, linkedin, portfolio, resume) VALUES (?, ?, ?, ?, ?)',
      [1, 'https://github.com/DeveshSarda5', 'https://www.linkedin.com/in/devesh-sarda-891412370/', '', 'https://drive.google.com/file/d/17YmgWIt7bI8yuCZuiJ7z1rhQIVXO5DpP/view?usp=sharing']
    );

    setTimeout(() => {
      console.log('Database initialized with seed data');
      db.close();
    }, 500);
  });
}
