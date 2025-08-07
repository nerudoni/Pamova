const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
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
  const addInfo = db.prepare(
    "Insert INTO users (username, password) VALUES (?, ?)"
  );
  //hash the password
  const salt = bcrypt.genSaltSync(10);
  password = bcrypt.hashSync(password, salt);
  addInfo.run(username, password);

  //log user in with cookie
  res.cookie("username", "some value", {
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
