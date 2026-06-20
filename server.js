const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// In-Memory Database Arrays
const users = [];
const posts = [];

// 1. Register Route
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required!" });
        }
        
        const userExists = users.find(u => u.username === username);
        if (userExists) {
            return res.status(400).json({ message: "Username already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: users.length + 1, username, password: hashedPassword };
        users.push(newUser);

        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 2. Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return res.status(400).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password!" });
    }

    res.json({ message: "Login successful!", username: user.username });
});

// 3. Create Post Route
app.post('/api/posts', (req, res) => {
    const { username, content } = req.body;
    if (!username || !content) {
        return res.status(400).json({ message: "Post content cannot be empty!" });
    }

    const newPost = {
        id: posts.length + 1,
        username: username,
        content: content,
        likes: 0,
        comments: []
    };
    posts.unshift(newPost);
    res.status(201).json(newPost);
});

// 4. Get All Posts Route
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// 5. Like Post Route
app.post('/api/posts/:id/like', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        return res.status(404).json({ message: "Post not found!" });
    }

    post.likes += 1;
    res.json({ likes: post.likes });
});

// 6. Comment Route
app.post('/api/posts/:id/comment', (req, res) => {
    const postId = parseInt(req.params.id);
    const { username, commentText } = req.body;
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found!" });
    }
    if (!commentText) {
        return res.status(400).json({ message: "Comment cannot be empty!" });
    }

    post.comments.push({ username, text: commentText });
    res.json(post.comments);
});

// Server Listen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});