require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL");
const multer = require("multer");
const path = require("path");

const app = express();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure storage location + filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Database setup
const createTables = db.transaction(() => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
    `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      client TEXT,
      location TEXT,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
    `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      projectID INTEGER,
      FOREIGN KEY (projectId) REFERENCES projects(id)
    )
    `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  is_done BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS note_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  shared_by_user_id INTEGER NOT NULL,
  shared_with_user_id INTEGER NOT NULL,
  can_edit BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id),
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id),
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
  UNIQUE(note_id, shared_with_user_id)
);`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id INTEGER,
    description TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`
  ).run();

  // Create indexes for better performance
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON activity_log(resource_type, resource_id)"
  ).run();
});
createTables();

// Authentication middleware
app.use(function (req, res, next) {
  res.locals.errors = [];
  try {
    const decoded = jwt.verify(req.cookies.username, process.env.JWTSECRET);
    req.user = decoded;
  } catch (err) {
    req.user = false;
  }
  res.locals.user = req.user;
  next();
});

// Helper to require authentication
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Activity logging utility
function logActivity(
  req,
  actionType,
  resourceType,
  resourceId,
  description,
  oldValues = null,
  newValues = null
) {
  try {
    // Defensive access: `req` may be a lightweight object (e.g. tempReq) or undefined.
    const ip =
      (req &&
        req.headers &&
        (req.headers["x-forwarded-for"] || req.headers["x-forwarded-for"])) ||
      (req && req.connection && req.connection.remoteAddress) ||
      (req && req.ip) ||
      null;

    const user = req && req.user ? req.user : null;

    if (!user || !user.userid) {
      // Missing user info — skip logging to avoid DB constraint errors and TypeErrors.
      console.warn(
        "logActivity: missing user information, skipping activity log",
        { actionType, resourceType, resourceId }
      );
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO activity_log (user_id, username, action_type, resource_type, resource_id, description, old_values, new_values, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.userid,
      user.username || null,
      actionType,
      resourceType,
      resourceId,
      description,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ip
    );

    console.log(
      `Activity logged: ${user.username} ${actionType} ${resourceType}`
    );
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw error - we don't want activity logging to break main functionality
  }
}

// Auth routes
app.post("/register", (req, res) => {
  let { username, email, password } = req.body;
  console.log("Received", username, password);

  const salt = bcrypt.genSaltSync(10);
  password = bcrypt.hashSync(password, salt);

  const addInfo = db.prepare(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
  );

  const result = addInfo.run(username, email, password);
  const lookupStatement = db.prepare("SELECT * FROM users WHERE id = ?");
  const userRow = lookupStatement.get(result.lastInsertRowid);

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      skyColor: "red",
      userid: userRow.id,
      username: userRow.username,
    },
    process.env.JWTSECRET
  );

  res.cookie("username", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  // Log registration activity
  const tempReq = { user: { userid: userRow.id, username: userRow.username } };
  logActivity(
    tempReq,
    "CREATE",
    "USER",
    userRow.id,
    `User registered: ${username} (${email})`
  );

  res.json({ success: true, message: "Received username and password!" });
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  console.log("Received", username, password);

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      skyColor: "red",
      userid: user.id,
      username: user.username,
    },
    process.env.JWTSECRET
  );

  res.cookie("username", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  // Log login activity
  const tempReq = { user: { userid: user.id, username: user.username } };
  logActivity(tempReq, "LOGIN", "USER", user.id, `User logged in`);

  res.json({ success: true, message: "Logged in successfully" });
});

// Project routes
app.post("/createProject", requireAuth, upload.array("images"), (req, res) => {
  const { title, description, client, location } = req.body;
  console.log("Creating project with title:", title);

  const projectStatement = db.prepare(
    "INSERT INTO projects (title, description, client, location, userId) VALUES (?, ?, ?, ?, ?)"
  );

  const result = projectStatement.run(
    title,
    description,
    client,
    location,
    req.user.userid
  );

  const projectId = result.lastInsertRowid;

  if (req.files && req.files.length > 0) {
    const imageStmt = db.prepare(
      "INSERT INTO images (image_url, projectID) VALUES (?, ?)"
    );
    req.files.forEach((file) => {
      const imagePath = `/uploads/${file.filename}`;
      imageStmt.run(imagePath, projectId);
    });
  }

  // Log project creation
  logActivity(
    req,
    "CREATE",
    "PROJECT",
    projectId,
    `Created project: ${title}`,
    null,
    { title, description, client, location }
  );

  res.json({
    success: true,
    message: "Project created successfully",
    project: { title, description, client, location, id: projectId },
  });
});

app.get("/projects", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM projects").all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/projects/:id", (req, res) => {
  const { id } = req.params;
  try {
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!row) {
      res.status(404).json({ error: "Project not found" });
    } else {
      res.json(row);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/manage/:id", (req, res) => {
  const { id } = req.params;
  try {
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!row) {
      res.status(404).json({ error: "Project not found" });
    } else {
      res.json(row);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/projects/:id", requireAuth, upload.array("images"), (req, res) => {
  const projectId = req.params.id;
  const { title, description, client, location, imagesToDelete } = req.body;

  if (!title || !description || !client || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Get old values for logging
    const oldProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(projectId);

    const stmt = db.prepare(`
      UPDATE projects 
      SET title = ?, description = ?, client = ?, location = ?
      WHERE id = ?
    `);

    const result = stmt.run(title, description, client, location, projectId);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Handle image deletions
    if (imagesToDelete) {
      const deleteStmt = db.prepare("DELETE FROM images WHERE id = ?");
      const deleteIds = Array.isArray(imagesToDelete)
        ? imagesToDelete
        : [imagesToDelete];
      deleteIds.forEach((id) => {
        deleteStmt.run(Number(id));
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imageStmt = db.prepare(
        "INSERT INTO images (image_url, projectID) VALUES (?, ?)"
      );
      req.files.forEach((file) => {
        const imagePath = `/uploads/${file.filename}`;
        imageStmt.run(imagePath, projectId);
      });
    }

    // Log project update
    const newValues = { title, description, client, location };
    const oldValues = {
      title: oldProject.title,
      description: oldProject.description,
      client: oldProject.client,
      location: oldProject.location,
    };
    logActivity(
      req,
      "UPDATE",
      "PROJECT",
      projectId,
      `Updated project: ${title}`,
      oldValues,
      newValues
    );

    res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/deleteProject/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    // Get project info for logging before deletion
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(Number(id));

    const deleteStmt = db.prepare("DELETE FROM projects WHERE id = ?");
    const result = deleteStmt.run(Number(id));

    if (result.changes === 0) {
      res.status(404).json({ error: "Project not found" });
    } else {
      // Log project deletion
      logActivity(
        req,
        "DELETE",
        "PROJECT",
        Number(id),
        `Deleted project: ${project.title}`,
        { title: project.title, description: project.description }
      );

      res.json({ success: true, message: "Project deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Image routes
app.get("/projects/:id/images", (req, res) => {
  const { id } = req.params;
  try {
    const images = db
      .prepare("SELECT * FROM images WHERE projectID = ?")
      .all(id);
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// OTP routes
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpString = otp.toString();

  try {
    db.prepare("INSERT INTO otp_codes (email, code) VALUES (?, ?)").run(
      email,
      otpString
    );

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    console.log("OTP sent:", otp);
    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error sending OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;
  const result = db
    .prepare("SELECT * FROM otp_codes WHERE email = ? AND code = ?")
    .get(email, code);

  if (result) {
    db.prepare("DELETE FROM otp_codes WHERE email = ?").run(email);
    res.json({ success: true, message: "OTP verified", email });
  } else {
    res.status(400).json({ error: "Invalid OTP or expired" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const stmt = db.prepare("UPDATE users SET password = ? WHERE email = ?");
  const result = stmt.run(hashedPassword, email);

  if (result.changes === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ success: true, message: "Password updated successfully" });
});

// Milestone routes
app.get("/projects/:id/milestones", (req, res) => {
  try {
    const milestones = db
      .prepare(
        `
      SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date
    `
      )
      .all(req.params.id);
    res.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/milestones", requireAuth, (req, res) => {
  const {
    project_id,
    title,
    description,
    due_date,
    status = "pending",
  } = req.body;

  if (!project_id || !title || !due_date) {
    return res
      .status(400)
      .json({ error: "Project ID, title, and due date are required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO milestones (project_id, title, description, due_date, status) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(project_id, title, description, due_date, status);
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/milestones/:id", requireAuth, (req, res) => {
  const { status, title, description, due_date } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE milestones 
      SET status = COALESCE(?, status), 
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          due_date = COALESCE(?, due_date)
      WHERE id = ?
    `);
    stmt.run(status, title, description, due_date, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/milestones/:id", requireAuth, (req, res) => {
  try {
    db.prepare("DELETE FROM milestones WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    res.status(500).json({ error: "Database error" });
  }
});

/// Notes routes - User-centric with sharing
app.get("/notes", requireAuth, (req, res) => {
  try {
    // Get user's own notes + notes shared with user
    const notes = db
      .prepare(
        `
        SELECT 
          n.*,
          u.username as author_username,
          ns.shared_with_user_id as shared_with_me,
          ns.can_edit as can_edit_shared,
          GROUP_CONCAT(DISTINCT shared_users.username) as shared_with_users
        FROM notes n
        JOIN users u ON n.user_id = u.id
        LEFT JOIN note_shares ns ON n.id = ns.note_id AND ns.shared_with_user_id = ?
        LEFT JOIN note_shares ns2 ON n.id = ns2.note_id
        LEFT JOIN users shared_users ON ns2.shared_with_user_id = shared_users.id
        WHERE n.user_id = ? OR ns.shared_with_user_id = ?
        GROUP BY n.id
        ORDER BY n.created_at DESC
      `
      )
      .all(req.user.userid, req.user.userid, req.user.userid);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/notes", requireAuth, (req, res) => {
  const {
    title,
    content,
    priority = "Medium",
    shared_with = [],
    can_edit = false,
  } = req.body;
  const user_id = req.user.userid;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const noteStmt = db.prepare(`
      INSERT INTO notes (user_id, title, content, priority) 
      VALUES (?, ?, ?, ?)
    `);
    const result = noteStmt.run(user_id, title, content, priority);
    const noteId = result.lastInsertRowid;

    // Handle sharing if specified
    if (shared_with && shared_with.length > 0) {
      const shareStmt = db.prepare(`
        INSERT INTO note_shares (note_id, shared_by_user_id, shared_with_user_id, can_edit)
        VALUES (?, ?, ?, ?)
      `);

      const canEditInt = can_edit ? 1 : 0;

      // Get usernames for logging
      const userStmt = db.prepare(
        "SELECT id, username FROM users WHERE id IN (" +
          shared_with.map(() => "?").join(",") +
          ")"
      );
      const sharedUsers = userStmt.all(...shared_with);
      const sharedUsernames = sharedUsers.map((u) => u.username).join(", ");

      shared_with.forEach((userId) => {
        if (userId !== user_id) {
          shareStmt.run(noteId, user_id, userId, canEditInt);
        }
      });

      // Log note sharing
      logActivity(
        req,
        "SHARE",
        "NOTE",
        noteId,
        `Shared note "${title}" with users: ${sharedUsernames} (edit: ${can_edit})`
      );
    }

    // Log note creation
    logActivity(req, "CREATE", "NOTE", noteId, `Created note: ${title}`, null, {
      title,
      priority,
    });

    res.json({ id: noteId, success: true });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/notes/:id", requireAuth, (req, res) => {
  const { title, content, priority, is_done, shared_with, can_edit } = req.body;
  const noteId = req.params.id;
  const userId = req.user.userid;

  try {
    // Get old values for logging
    const oldNote = db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);

    const noteCheck = db
      .prepare(
        `
        SELECT n.user_id, ns.can_edit 
        FROM notes n 
        LEFT JOIN note_shares ns ON n.id = ns.note_id AND ns.shared_with_user_id = ?
        WHERE n.id = ? AND (n.user_id = ? OR ns.shared_with_user_id = ?)
      `
      )
      .get(userId, noteId, userId, userId);

    if (!noteCheck) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }

    if (noteCheck.user_id !== userId && !noteCheck.can_edit) {
      return res
        .status(403)
        .json({ error: "No edit permissions for this note" });
    }

    const updateFields = [];
    const params = [];

    if (title !== undefined && noteCheck.user_id === userId) {
      updateFields.push("title = ?");
      params.push(title);
    }

    if (content !== undefined) {
      updateFields.push("content = ?");
      params.push(content);
    }

    if (priority !== undefined && noteCheck.user_id === userId) {
      updateFields.push("priority = ?");
      params.push(priority);
    }

    if (is_done !== undefined) {
      updateFields.push("is_done = ?");
      params.push(is_done ? 1 : 0);
    }

    if (updateFields.length > 0) {
      params.push(noteId);
      const stmt = db.prepare(
        `UPDATE notes SET ${updateFields.join(", ")} WHERE id = ?`
      );
      stmt.run(...params);
    }

    // Handle sharing updates
    if (shared_with !== undefined && noteCheck.user_id === userId) {
      // Get current shares for logging
      const currentShares = db
        .prepare(
          "SELECT shared_with_user_id FROM note_shares WHERE note_id = ? AND shared_by_user_id = ?"
        )
        .all(noteId, userId);

      db.prepare(
        "DELETE FROM note_shares WHERE note_id = ? AND shared_by_user_id = ?"
      ).run(noteId, userId);

      if (shared_with.length > 0) {
        const shareStmt = db.prepare(`
          INSERT INTO note_shares (note_id, shared_by_user_id, shared_with_user_id, can_edit)
          VALUES (?, ?, ?, ?)
        `);

        const canEditInt = can_edit ? 1 : 0;

        // Get usernames for logging
        const userStmt = db.prepare(
          "SELECT id, username FROM users WHERE id IN (" +
            shared_with.map(() => "?").join(",") +
            ")"
        );
        const sharedUsers = userStmt.all(...shared_with);
        const sharedUsernames = sharedUsers.map((u) => u.username).join(", ");

        shared_with.forEach((shareUserId) => {
          if (shareUserId !== userId) {
            shareStmt.run(noteId, userId, shareUserId, canEditInt);
          }
        });

        // Log sharing changes
        logActivity(
          req,
          "SHARE",
          "NOTE",
          noteId,
          `Updated sharing for note "${oldNote.title}" with users: ${sharedUsernames} (edit: ${can_edit})`
        );
      } else if (currentShares.length > 0) {
        // Log removal of all shares
        logActivity(
          req,
          "SHARE",
          "NOTE",
          noteId,
          `Removed all shares for note: ${oldNote.title}`
        );
      }
    }

    // Log note update
    if (updateFields.length > 0) {
      const newValues = {};
      if (title !== undefined) newValues.title = title;
      if (content !== undefined)
        newValues.content = content.substring(0, 100) + "..."; // Truncate long content
      if (priority !== undefined) newValues.priority = priority;
      if (is_done !== undefined) newValues.is_done = is_done;

      const oldValues = {
        title: oldNote.title,
        content: oldNote.content.substring(0, 100) + "...",
        priority: oldNote.priority,
        is_done: oldNote.is_done,
      };

      logActivity(
        req,
        "UPDATE",
        "NOTE",
        noteId,
        `Updated note: ${oldNote.title}`,
        oldValues,
        newValues
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/notes/:id", requireAuth, (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.userid;

  try {
    // Get note info for logging before deletion
    const note = db
      .prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
      .get(noteId, userId);

    if (!note) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }

    // Delete shares first, then note
    db.prepare("DELETE FROM note_shares WHERE note_id = ?").run(noteId);
    db.prepare("DELETE FROM notes WHERE id = ?").run(noteId);

    // Log note deletion
    logActivity(req, "DELETE", "NOTE", noteId, `Deleted note: ${note.title}`, {
      title: note.title,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Get users for sharing dropdown
app.get("/users", requireAuth, (req, res) => {
  try {
    const users = db
      .prepare(
        "SELECT id, username, email FROM users WHERE id != ? ORDER BY username"
      )
      .all(req.user.userid);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Activity log routes
app.get("/activity-log", requireAuth, (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id,
      action_type,
      resource_type,
      start_date,
      end_date,
      search,
    } = req.query;

    let whereConditions = ["1=1"];
    let params = [];

    // Build filter conditions
    if (user_id) {
      whereConditions.push("al.user_id = ?");
      params.push(user_id);
    }

    if (action_type) {
      whereConditions.push("al.action_type = ?");
      params.push(action_type);
    }

    if (resource_type) {
      whereConditions.push("al.resource_type = ?");
      params.push(resource_type);
    }

    if (start_date) {
      whereConditions.push("DATE(al.created_at) >= ?");
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push("DATE(al.created_at) <= ?");
      params.push(end_date);
    }

    if (search) {
      whereConditions.push("(al.description LIKE ? OR al.username LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(" AND ");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM activity_log al 
      WHERE ${whereClause}
    `);
    const totalResult = countStmt.get(...params);
    const total = totalResult.total;

    // Get activity logs
    const stmt = db.prepare(`
      SELECT 
        al.*,
        u.username as performer_username
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const activities = stmt.all(...params, limit, offset);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/activity-log/stats", requireAuth, (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Recent activity count
    const recentStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activity_log 
      WHERE created_at >= datetime('now', ?)
    `);
    const recent = recentStmt.get(`-${days} days`);

    // Activity by type
    const byTypeStmt = db.prepare(`
      SELECT action_type, COUNT(*) as count
      FROM activity_log
      WHERE created_at >= datetime('now', ?)
      GROUP BY action_type
      ORDER BY count DESC
    `);
    const byType = byTypeStmt.all(`-${days} days`);

    // Most active users
    const activeUsersStmt = db.prepare(`
      SELECT username, COUNT(*) as activity_count
      FROM activity_log
      WHERE created_at >= datetime('now', ?)
      GROUP BY user_id, username
      ORDER BY activity_count DESC
      LIMIT 10
    `);
    const activeUsers = activeUsersStmt.all(`-${days} days`);

    res.json({
      recent_activity: recent.count,
      activity_by_type: byType,
      most_active_users: activeUsers,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Get available filter options
app.get("/activity-log/filters", requireAuth, (req, res) => {
  try {
    const actionTypes = db
      .prepare(
        `
      SELECT DISTINCT action_type 
      FROM activity_log 
      ORDER BY action_type
    `
      )
      .all()
      .map((row) => row.action_type);

    const resourceTypes = db
      .prepare(
        `
      SELECT DISTINCT resource_type 
      FROM activity_log 
      ORDER BY resource_type
    `
      )
      .all()
      .map((row) => row.resource_type);

    const users = db
      .prepare(
        `
      SELECT DISTINCT al.user_id, al.username 
      FROM activity_log al 
      ORDER BY al.username
    `
      )
      .all();

    res.json({
      action_types: actionTypes,
      resource_types: resourceTypes,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ error: "Database error" });
  }
});
// Utility routes
app.get("/check-login", (req, res) => {
  if (req.user) {
    return res.json({ loggedIn: true, user: req.user });
  } else {
    return res.json({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
