const express = require("express");

const path = require("path");
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/add", (req, res) => {
  const a = parseInt(req.body.a);
  const b = parseInt(req.body.b);

  res.json({
    msg: a + b,
  });
});

app.post("/sub", (req, res) => {
  const a = parseInt(req.body.a);
  const b = parseInt(req.body.b);

  res.json({
    msg: a - b,
  });
});

app.post("/div", (req, res) => {
  const a = parseInt(req.body.a);
  const b = parseInt(req.body.b);
  if (b === 0) return res.status(400).json({ msg: "Cannot divide by zero" });
  res.json({
    msg: a / b,
  });
});

app.post("/mul", (req, res) => {

  const a = parseInt(req.body.a);
  const b = parseInt(req.body.b);

  res.json({
    msg: a * b,
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
