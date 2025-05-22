const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
const FILE_PATH = "./authentication.json";
app.use(express.static(path.join(__dirname, "public")));

const JWT_SECRET = "helloiamangeshchauhanpapaissduniyaka";

app.use(express.json());

if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ users: {} }, null, 2));
}

function loadUsers() {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data || '{"users": {}}');
  } catch {
    return { users: {} };
  }
}

function saveUsers(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

app.post("/signup", (req, res) => {
  const { username, email, password, fullName } = req.body;
  const data = loadUsers();

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (data.users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const emailExists = Object.values(data.users).some(
    (user) => user.email === email
  );
  if (emailExists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  data.users[username] = { username, email, password, fullName };
  saveUsers(data);

  res.json({
    message: "User signed up successfully",
    user: data.users[username],
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const data = loadUsers();

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userEntry = Object.entries(data.users).find(
    ([, user]) => user.email === email
  );

  if (!userEntry) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const [username, user] = userEntry;

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      username: username,
    },
    JWT_SECRET
  );

  res.json({
    message: "Login successful",
    token,
    username,
    fullName: user.fullName,
    email: user.email,
  });
});

app.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;

  

  const token = authHeader.replace("Bearer ", "");

  try {
    const decodedUserInformation = jwt.verify(token, JWT_SECRET);
    const data = loadUsers();

    const users = Object.values(data.users);
    const foundUser = users.find(
      (u) => u.username === decodedUserInformation.username
    );

    if (foundUser) {
      res.json({
        username: foundUser.username,
        email: foundUser.email,
        fullName: foundUser.fullName,
      });
    } else {
      res.status(403).json({
        msg: "Invalid token",
      });
    }
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
});


app.listen(3000, () => {
  console.log("Server is running at: http://localhost:3000");
});
