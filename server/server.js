require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
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
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
    `
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
  let { username, password } = req.body;
  console.log("Recieved", username, password);

  //hash the password
  const salt = bcrypt.genSaltSync(10);
  password = bcrypt.hashSync(password, salt);
  //add to user database
  const addInfo = db.prepare(
    "Insert INTO users (username, password) VALUES (?, ?)"
  );
  //get user id
  const result = addInfo.run(username, password);
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
  res.json({ success: true, message: "Logged in successfully" });
});
app.post("/createProject", (req, res) => {
  const { title, description } = req.body;
  console.log(
    "Creating project with title:",
    title,
    "and description:",
    description
  );

  //save into database
  const ourStatement = db.prepare(
    "INSERT INTO projects (title, description, userId) VALUES (?, ?, ?)"
  );
  const result = ourStatement.run(title, description, res.locals.user.userid);

  // Here you would typically save the project to the database
  // For now, we just return a success message
  res.json({
    success: true,
    message: "Project created successfully",
    project: { title, description },
  });
});

//Redirect user to dashboard if already ogged in
app.get("/check-login", (req, res) => {
  if (req.user) {
    return res.json({ loggedIn: true, user: req.user });
  } else {
    return res.json({ loggedIn: false });
  }
});
app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(3000);
