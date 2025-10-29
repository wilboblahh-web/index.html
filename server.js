const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Helper functions to read and write to the JSON DB
const readDb = () => {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
};

const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Serve the main dashboard page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// API Endpoints for blocked URLs
app.get('/api/blocked-urls', (req, res) => {
    const db = readDb();
    res.json(db.blockedUrls);
});

app.post('/api/blocked-urls', (req, res) => {
    const { url } = req.body;
    if (url) {
        const db = readDb();
        if (!db.blockedUrls.includes(url)) {
            db.blockedUrls.push(url);
            writeDb(db);
            res.status(201).json({ message: 'URL blocked successfully.' });
        } else {
            res.status(400).json({ message: 'URL already blocked.' });
        }
    } else {
        res.status(400).json({ message: 'URL is required.' });
    }
});

app.delete('/api/blocked-urls', (req, res) => {
    const { url } = req.body;
    const db = readDb();
    const index = db.blockedUrls.indexOf(url);
    if (index > -1) {
        db.blockedUrls.splice(index, 1);
        writeDb(db);
        res.json({ message: 'URL unblocked successfully.' });
    } else {
        res.status(404).json({ message: 'URL not found.' });
    }
});

// API Endpoints for notifications
app.get('/api/notifications', (req, res) => {
    const db = readDb();
    res.json(db.notifications);
});

app.post('/api/notifications', (req, res) => {
    const { message } = req.body;
    if (message) {
        const db = readDb();
        const newNotification = { message, timestamp: new Date().toISOString() };
        db.notifications.push(newNotification);
        writeDb(db);
        res.status(201).json({ message: 'Notification created.' });
    } else {
        res.status(400).json({ message: 'Message is required.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
