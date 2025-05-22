const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const FILE_PATH = "./authentication.json";
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());

function generateToken() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
}

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

  const token = generateToken();
  user.token = token;

  saveUsers(data);

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

  if (!authHeader) {
    return res.status(401).json({ msg: "Authorization header missing" });
  }
  const token = authHeader.replace("Bearer ", "");

  const data = loadUsers();
  const users = Object.values(data.users);

  const foundUser = users.find((u) => u.token === token);

  if (foundUser) {
    res.json({
      username: foundUser.username,
      password: foundUser.password,
      email: foundUser.email,
      fullName: foundUser.fullName,
    });
  } else {
    res.status(403).json({
      msg: "Invalid token",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running at: http://localhost:3000");
});
