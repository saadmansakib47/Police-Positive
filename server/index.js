const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'police_system.db'));

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('civilian', 'operator', 'supervisor', 'patrol')),
      badgeNumber TEXT,
      department TEXT,
      phone TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Complaints table
  db.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caseNumber TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      reporterInfo TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'investigating', 'resolved', 'closed')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      assignedOfficer INTEGER,
      createdBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedOfficer) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  // Evidence files table
  db.run(`
    CREATE TABLE IF NOT EXISTS evidence_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaintId INTEGER NOT NULL,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
    )
  `);

  // Timeline events table
  db.run(`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaintId INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      userId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE-${year}-${random}`;
};

const addTimelineEvent = (complaintId, type, description, userId = null) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO timeline_events (complaintId, type, description, userId) VALUES (?, ?, ?, ?)',
      [complaintId, type, description, userId],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, badgeNumber, department, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (email, password, firstName, lastName, role, badgeNumber, department, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, role, badgeNumber, department, phone],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ message: 'Email already exists' });
          }
          return res.status(500).json({ message: 'Registration failed' });
        }

        const user = {
          id: this.lastID,
          email,
          firstName,
          lastName,
          role,
          badgeNumber,
          department,
          phone
        };

        const token = generateToken(user);
        res.status(201).json({ user, token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Server error' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        const token = generateToken(userWithoutPassword);
        
        res.json({ user: userWithoutPassword, token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, firstName, lastName, role, badgeNumber, department, phone FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    }
  );
});

// Complaints Routes
app.post('/api/complaints', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const complaintData = JSON.parse(req.body.complaintData || '{}');
    const { type, category, title, description, location, reporterInfo } = complaintData;

    if (!type || !category || !title || !description || !location || !reporterInfo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const caseNumber = generateCaseNumber();
    const priority = type === 'emergency' ? 'urgent' : 'medium';

    db.run(
      `INSERT INTO complaints (caseNumber, type, category, title, description, location, reporterInfo, priority, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [caseNumber, type, category, title, description, location, JSON.stringify(reporterInfo), priority, req.user.id],
      async function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to create complaint' });
        }

        const complaintId = this.lastID;

        // Handle file uploads
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            await new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO evidence_files (complaintId, filename, originalName, mimetype, size, path) VALUES (?, ?, ?, ?, ?, ?)',
                [complaintId, file.filename, file.originalname, file.mimetype, file.size, file.path],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }
        }

        // Add initial timeline event
        await addTimelineEvent(complaintId, 'created', 'Complaint submitted', req.user.id);

        // Get the created complaint with all details
        db.get(
          `SELECT c.*, u.firstName || ' ' || u.lastName as createdByName
           FROM complaints c
           LEFT JOIN users u ON c.createdBy = u.id
           WHERE c.id = ?`,
          [complaintId],
          (err, complaint) => {
            if (err) {
              return res.status(500).json({ message: 'Failed to retrieve complaint' });
            }

            // Parse JSON fields
            complaint.reporterInfo = JSON.parse(complaint.reporterInfo);
            
            res.status(201).json(complaint);
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/complaints', authenticateToken, (req, res) => {
  const { status, priority, assignedTo, search, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT c.*, 
           u1.firstName || ' ' || u1.lastName as createdByName,
           u2.firstName || ' ' || u2.lastName as assignedOfficerName
    FROM complaints c
    LEFT JOIN users u1 ON c.createdBy = u1.id
    LEFT JOIN users u2 ON c.assignedOfficer = u2.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND c.priority = ?';
    params.push(priority);
  }
  
  if (assignedTo) {
    query += ' AND c.assignedOfficer = ?';
    params.push(assignedTo);
  }
  
  if (search) {
    query += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.caseNumber LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ' ORDER BY c.createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, complaints) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch complaints' });
    }
    
    // Parse JSON fields
    const processedComplaints = complaints.map(complaint => ({
      ...complaint,
      reporterInfo: JSON.parse(complaint.reporterInfo)
    }));
    
    res.json(processedComplaints);
  });
});

app.get('/api/complaints/my', authenticateToken, (req, res) => {
  const query = `
    SELECT c.*, 
           u1.firstName || ' ' || u1.lastName as createdByName,
           u2.firstName || ' ' || u2.lastName as assignedOfficerName
    FROM complaints c
    LEFT JOIN users u1 ON c.createdBy = u1.id
    LEFT JOIN users u2 ON c.assignedOfficer = u2.id
    WHERE c.assignedOfficer = ?
    ORDER BY c.createdAt DESC
  `;
  
  db.all(query, [req.user.id], (err, complaints) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch complaints' });
    }
    
    const processedComplaints = complaints.map(complaint => ({
      ...complaint,
      reporterInfo: JSON.parse(complaint.reporterInfo)
    }));
    
    res.json(processedComplaints);
  });
});

app.get('/api/complaints/stats', authenticateToken, (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) as count FROM complaints',
    pending: "SELECT COUNT(*) as count FROM complaints WHERE status = 'pending'",
    investigating: "SELECT COUNT(*) as count FROM complaints WHERE status = 'investigating'",
    resolved: "SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'",
    urgent: "SELECT COUNT(*) as count FROM complaints WHERE priority = 'urgent'",
    myActive: 'SELECT COUNT(*) as count FROM complaints WHERE assignedOfficer = ? AND status NOT IN ("resolved", "closed")'
  };
  
  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    const params = key === 'myActive' ? [req.user.id] : [];
    
    db.get(query, params, (err, result) => {
      if (err) {
        console.error(`Error fetching ${key} stats:`, err);
        stats[key] = 0;
      } else {
        stats[key] = result.count;
      }
      
      completed++;
      if (completed === total) {
        res.json(stats);
      }
    });
  });
});

app.get('/api/complaints/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT c.*, 
           u1.firstName || ' ' || u1.lastName as createdByName,
           u2.firstName || ' ' || u2.lastName as assignedOfficerName
    FROM complaints c
    LEFT JOIN users u1 ON c.createdBy = u1.id
    LEFT JOIN users u2 ON c.assignedOfficer = u2.id
    WHERE c.id = ?
  `;
  
  db.get(query, [id], (err, complaint) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch complaint' });
    }
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Get evidence files
    db.all(
      'SELECT * FROM evidence_files WHERE complaintId = ?',
      [id],
      (err, files) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to fetch evidence files' });
        }
        
        // Get timeline events
        db.all(
          `SELECT t.*, u.firstName || ' ' || u.lastName as userName
           FROM timeline_events t
           LEFT JOIN users u ON t.userId = u.id
           WHERE t.complaintId = ?
           ORDER BY t.createdAt ASC`,
          [id],
          (err, timeline) => {
            if (err) {
              return res.status(500).json({ message: 'Failed to fetch timeline' });
            }
            
            complaint.reporterInfo = JSON.parse(complaint.reporterInfo);
            complaint.evidence = { files };
            complaint.timeline = timeline;
            
            res.json(complaint);
          }
        );
      }
    );
  });
});

app.put('/api/complaints/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const validStatuses = ['pending', 'under_review', 'investigating', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  db.run(
    'UPDATE complaints SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    async function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update status' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      // Add timeline event
      const description = note ? `Status changed to ${status}: ${note}` : `Status changed to ${status}`;
      await addTimelineEvent(id, 'status_change', description, req.user.id);
      
      res.json({ message: 'Status updated successfully' });
    }
  );
});

app.put('/api/complaints/:id/assign', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { officerId } = req.body;
  
  if (!officerId) {
    return res.status(400).json({ message: 'Officer ID is required' });
  }
  
  // Verify officer exists
  db.get(
    'SELECT firstName, lastName FROM users WHERE id = ? AND role IN ("operator", "patrol")',
    [officerId],
    (err, officer) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!officer) {
        return res.status(404).json({ message: 'Officer not found' });
      }
      
      db.run(
        'UPDATE complaints SET assignedOfficer = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [officerId, id],
        async function(err) {
          if (err) {
            return res.status(500).json({ message: 'Failed to assign complaint' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ message: 'Complaint not found' });
          }
          
          // Add timeline event
          const description = `Assigned to ${officer.firstName} ${officer.lastName}`;
          await addTimelineEvent(id, 'assignment', description, req.user.id);
          
          res.json({ message: 'Complaint assigned successfully' });
        }
      );
    }
  );
});

app.get('/api/complaints/track/:identifier', (req, res) => {
  const { identifier } = req.params;
  
  // Try to find by case number first, then by phone number
  let query = `
    SELECT c.*, 
           u1.firstName || ' ' || u1.lastName as createdByName,
           u2.firstName || ' ' || u2.lastName as assignedOfficerName
    FROM complaints c
    LEFT JOIN users u1 ON c.createdBy = u1.id
    LEFT JOIN users u2 ON c.assignedOfficer = u2.id
    WHERE c.caseNumber = ?
  `;
  
  db.get(query, [identifier], (err, complaint) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to track complaint' });
    }
    
    if (!complaint) {
      // Try searching by phone number in reporterInfo
      query = `
        SELECT c.*, 
               u1.firstName || ' ' || u1.lastName as createdByName,
               u2.firstName || ' ' || u2.lastName as assignedOfficerName
        FROM complaints c
        LEFT JOIN users u1 ON c.createdBy = u1.id
        LEFT JOIN users u2 ON c.assignedOfficer = u2.id
        WHERE c.reporterInfo LIKE ?
      `;
      
      db.get(query, [`%"phone":"${identifier}"%`], (err, complaint) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to track complaint' });
        }
        
        if (!complaint) {
          return res.status(404).json({ message: 'No complaint found with this identifier' });
        }
        
        complaint.reporterInfo = JSON.parse(complaint.reporterInfo);
        res.json(complaint);
      });
    } else {
      complaint.reporterInfo = JSON.parse(complaint.reporterInfo);
      res.json(complaint);
    }
  });
});

// Get all users (for assignment dropdown)
app.get('/api/users', authenticateToken, (req, res) => {
  const { role } = req.query;
  
  let query = 'SELECT id, firstName, lastName, role, badgeNumber FROM users';
  const params = [];
  
  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }
  
  query += ' ORDER BY firstName, lastName';
  
  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(users);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Police System API Server running on port ${PORT}`);
  console.log(`📁 File uploads directory: ${uploadsDir}`);
  console.log(`🗄️  Database: ${path.join(__dirname, 'police_system.db')}`);
});