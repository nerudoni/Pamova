const express = require("express");
const cors = require("cors");
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL");
const app = express();

app.use(cors());
app.use(express.json());

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
  const { username, password } = req.body;
  console.log("Recieved", username, password);
  const addInfo = db.prepare(
    "Insert INTO users (username, password) VALUES (?, ?)"
  );
  addInfo.run(username, password);
  res.json({ success: true, message: "Recieved username and password!" });
});

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(3000);
