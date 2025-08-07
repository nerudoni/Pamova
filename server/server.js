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
});
createTables();

//end of database setup

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
  const userRow = lookupStatement.get(result.lastInsertRowid).id;

  //log user in with cookie

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      skyColor: "blue",
      userid: userRow.id,
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

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(3000);
