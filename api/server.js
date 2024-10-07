// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const cors = require('cors');

// Add this line before your app.use() calls
app.use(cors({ origin: 'https://livenotepad1.vercel.app' }));

// Initialize notes as an empty object
let notes = {};

// Serve static files from the "public" directory, relative to where server.js is located
app.use(express.static(path.join(__dirname, '../public')));  // Adjusted to go up one directory level

// Load existing notes from file
const loadNotes = () => {
    try {
        if (fs.existsSync('notes.json')) {
            const data = fs.readFileSync('notes.json', 'utf8');
            notes = JSON.parse(data);
            console.log('Notes loaded successfully.');
        } else {
            console.log('No notes file found, starting with an empty note set.');
        }
    } catch (error) {
        console.error('Error reading notes file:', error);
    }
};

// Save notes to file
const saveNotes = () => {
    try {
        fs.writeFileSync('notes.json', JSON.stringify(notes, null, 2)); // Save notes with pretty formatting
        console.log('Notes saved successfully.');
    } catch (error) {
        console.error('Error saving notes file:', error);
    }
};

// Emit notes to all clients when they connect
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    
    // Send existing notes to the new client
    socket.emit('loadNotes', notes);

    // Listen for note updates
    socket.on('noteUpdate', (data) => {
        const { noteId, content } = data;
        notes[noteId] = content; // Update the note in memory
        saveNotes(); // Save the notes to file
        console.log(`Note updated: ${noteId}`);
        socket.broadcast.emit('noteUpdate', data); // Broadcast the update to other clients
    });

    // Listen for delete notepad requests
    socket.on('deleteNotepad', (noteId) => {
        if (notes[noteId]) {
            delete notes[noteId]; // Remove the note from memory
            saveNotes(); // Save the updated notes to file
            console.log(`Note deleted: ${noteId}`);
            socket.broadcast.emit('noteDelete', noteId); // Notify other clients
        } else {
            console.log(`Note not found: ${noteId}`);
        }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Load notes on server start
loadNotes();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
