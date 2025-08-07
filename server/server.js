const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  console.log("Recieved", username, password);
  res.json({ success: true, message: "Recieved username and password!" });
});

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(3000);
