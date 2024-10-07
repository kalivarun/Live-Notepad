// app.js
// Connect to the server using Socket.IO
const socket = io();

// Get the container where notepads will be rendered
const notepadContainer = document.getElementById('notepad-container');
const addNotepadBtn = document.getElementById('addNotepad');

// Listen for the initial set of notepads from the server
socket.on('loadNotes', (notepads) => {
    renderNotepads(notepads);
});

// Listen for updates to the notepads (new, deleted, or updated)
socket.on('noteUpdate', ({ noteId, content }) => {
    const notepad = document.getElementById(noteId);
    if (notepad) {
        notepad.value = content; // Update the content of the notepad
    }
});

// Listen for deleted notepad events
socket.on('noteDelete', (noteId) => {
    const notepadDiv = document.getElementById(noteId)?.parentElement;
    if (notepadDiv) {
        notepadContainer.removeChild(notepadDiv); // Remove the notepad element from the DOM
    }
});

// Add a new notepad
addNotepadBtn.addEventListener('click', () => {
    const newNoteId = `note${Date.now()}`; // Create a unique ID for the new notepad
    const content = ''; // Empty content for the new notepad
    notes[newNoteId] = content; // Add the new note to the notes object
    socket.emit('noteUpdate', { noteId: newNoteId, content }); // Emit the event to add a new notepad
});

// Render notepads dynamically
function renderNotepads(notepads) {
    notepadContainer.innerHTML = ''; // Clear current notepads

    for (const noteId in notepads) {
        const notepadDiv = document.createElement('div');
        notepadDiv.classList.add('notepad-wrapper');
        notepadDiv.id = noteId; // Set the ID for the notepad container

        // Create a textarea for the notepad
        const textarea = document.createElement('textarea');
        textarea.id = noteId;
        textarea.value = notepads[noteId];

        // Emit the updated content when typing
        textarea.addEventListener('input', () => {
            const content = textarea.value;
            socket.emit('noteUpdate', { noteId, content });
        });

        // Create a delete button for the notepad
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            socket.emit('deleteNotepad', noteId); // Emit delete event
        });

        // Append the textarea and delete button to the notepad div
        notepadDiv.appendChild(textarea);
        notepadDiv.appendChild(deleteBtn);

        // Append the notepad div to the container
        notepadContainer.appendChild(notepadDiv);
    }
}
