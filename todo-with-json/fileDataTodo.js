const fs = require('fs');
const express = require('express');
const path =require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const FILE_PATH = './toDo.json';

if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ users: {} }, null, 2));
}

function loadTodos() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(data || '{"users": {}}');
    } catch (error) {
        console.error("Error loading JSON:", error);
        return { users: {} };
    }
}

// Save todos to file
function saveTodos(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// Add todo
app.post('/add', (req, res) => {
    const {user} = req.body;
    const { title } = req.body;

    if (!title) {
        return res.status(400).send("Title is required");
    }

    const data = loadTodos();
    const id = Math.floor(Math.random() * 9000);

    if (!data.users[user]) data.users[user] = [];
    data.users[user].push({ id, title });

    saveTodos(data);

    res.json({ message: "Todo added", todos: data.users[user] });
});

//Get all todos for a user
app.get('/todos', (req, res) => {
    const user = req.query.user; 
    const data = loadTodos();

    if (!data.users[user]) {
        return res.status(404).send("User not found");
    }

    res.json(data.users[user]);
});


//Update a todo by ID
app.put('/update', (req, res) => {
    const user = req.query.user;
    const id = parseInt(req.query.id);
    const { title } = req.body;

    if (!title) return res.status(400).send("Title is required");

    const data = loadTodos();

    if (!data.users[user]) return res.status(404).send("User not found");

    const todo = data.users[user].find(t => t.id === id);
    if (!todo) return res.status(404).send("Todo not found");

    todo.title = title;
    saveTodos(data);

    res.json({ message: "Todo updated", todo });
});

//Delete a todo by ID
app.delete('/delete', (req, res) => {
    const user = req.query.user;
    const id = parseInt(req.query.id);

    const data = loadTodos();

    if (!data.users[user]) return res.status(404).send("User not found");

    const index = data.users[user].findIndex(t => t.id === id);
    if (index === -1) return res.status(404).send("Todo not found");

    data.users[user].splice(index, 1);
    saveTodos(data);

    res.json({ message: "Todo deleted", todos: data.users[user] });
});

app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
