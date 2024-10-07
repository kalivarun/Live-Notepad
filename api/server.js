// api/notepad.js
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

let notes = {};

// Load existing notes from file (ensure this file exists)
const loadNotes = () => {
    try {
        if (fs.existsSync(path.join(__dirname, '../notes.json'))) {
            const data = fs.readFileSync(path.join(__dirname, '../notes.json'), 'utf8');
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
        fs.writeFileSync(path.join(__dirname, '../notes.json'), JSON.stringify(notes, null, 2));
        console.log('Notes saved successfully.');
    } catch (error) {
        console.error('Error saving notes file:', error);
    }
};

// Create and export the serverless function
export default function handler(req, res) {
    if (req.method === 'GET') {
        loadNotes();
        res.status(200).json(notes);
    } else if (req.method === 'POST') {
        const { noteId, content } = req.body;
        notes[noteId] = content;
        saveNotes();
        res.status(200).json({ message: 'Note updated', noteId });
    } else if (req.method === 'DELETE') {
        const { noteId } = req.body;
        if (notes[noteId]) {
            delete notes[noteId];
            saveNotes();
            res.status(200).json({ message: 'Note deleted', noteId });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
