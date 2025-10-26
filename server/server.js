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
    cb(null, "uploads/"); // stores images inside backend/uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
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

//setup database
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`
  ).run();
});
createTables();

//end of database setup

//middleware to decode cookie and set user
app.use(function (req, res, next) {
  res.locals.errors = [];
  //try to decode incoming cookie
  try {
    const decoded = jwt.verify(req.cookies.username, process.env.JWTSECRET);
    req.user = decoded;
  } catch (err) {
    req.user = false;
  }

  res.locals.user = req.user;
  console.log(req.user);
  next();
});

app.post("/register", (req, res) => {
  let { username, email, password } = req.body;
  console.log("Recieved", username, password);

  //hash the password
  const salt = bcrypt.genSaltSync(10);
  password = bcrypt.hashSync(password, salt);
  //add to user database
  const addInfo = db.prepare(
    "Insert INTO users (username, email, password) VALUES (?, ?, ?)"
  );
  //get user id
  const result = addInfo.run(username, email, password);
  const lookupStatement = db.prepare("SELECT * FROM users WHERE id = ?");
  const userRow = lookupStatement.get(result.lastInsertRowid);

  //make cookie

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

  res.json({ success: true, message: "Recieved username and password!" });
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  console.log("Recieved", username, password);
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
  res.json({ success: true, message: "Logged in successfully" });
});

app.post("/createProject", upload.array("images"), (req, res) => {
  const { title, description, client, location } = req.body;
  console.log(
    "Creating project with title:",
    title,
    "and description:",
    description
  );

  //save into database
  const projectStatement = db.prepare(
    "INSERT INTO projects (title, description, client, location, userId) VALUES (?, ?, ?, ?, ?)"
  );
  const result = projectStatement.run(
    title,
    description,
    client,
    location,
    res.locals.user.userid
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

  res.json({
    success: true,
    message: "Project created successfully",
    project: { title, description, client, location, id: projectId },
  });
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  //Create a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpString = otp.toString(); // Explicit conversion

  console.log("Raw OTP:", otp);
  console.log("OTP as string:", otpString);
  console.log("OTP string length:", otpString.length);

  try {
    // Store OTP in DB
    db.prepare("INSERT INTO otp_codes (email, code) VALUES (?, ?)").run(
      email,
      otpString
    );

    // Send the OTP email
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
    db.prepare("DELETE FROM otp_codes WHERE email = ?").run(email); // delete after use
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

//Redirect user to dashboard if already logged in
app.get("/check-login", (req, res) => {
  if (req.user) {
    return res.json({ loggedIn: true, user: req.user });
  } else {
    return res.json({ loggedIn: false });
  }
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
app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

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

app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.json({ success: true, message: "Logged out successfully" });
});

app.put("/projects/:id", (req, res) => {
  const projectId = req.params.id;
  const { title, description, client, location } = req.body;

  // Validate required fields
  if (!title || !description || !client || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Update project in database
    const stmt = db.prepare(`
      UPDATE projects 
      SET title = ?, description = ?, client = ?, location = ?
      WHERE id = ?
    `);

    const result = stmt.run(title, description, client, location, projectId);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/deleteProject/:id", (req, res) => {
  console.log("delete accessed");
  const { id } = req.params;
  try {
    const deleteStmt = db.prepare("DELETE FROM projects WHERE id = ?");
    console.log("test 1 accessed");
    const result = deleteStmt.run(Number(id));
    console.log("test 2 accessed");
    if (result.changes === 0) {
      res.status(404).json({ error: "Project not found" });
      console.log("test 3 accessed");
    } else {
      res.json({ success: true, message: "Project deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(3000);
