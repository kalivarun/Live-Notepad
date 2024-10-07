const socket = io(); // If you still want to use Socket.IO, but this is optional.

async function fetchNotes() {
    const response = await fetch('/api/notepad');
    if (response.ok) {
        const data = await response.json();
        console.log('Fetched notes:', data);
        // Populate your frontend with the notes here
    } else {
        console.error('Error fetching notes:', response.status);
    }
}

async function updateNote(noteId, content) {
    const response = await fetch('/api/server', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId, content }),
    });

    if (response.ok) {
        console.log('Note updated');
        fetchNotes(); // Optionally refresh notes after update
    } else {
        console.error('Error updating note:', response.status);
    }
}

async function deleteNotepad(noteId) {
    const response = await fetch('/api/notepad', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId }),
    });

    if (response.ok) {
        console.log('Note deleted');
        fetchNotes(); // Optionally refresh notes after deletion
    } else {
        console.error('Error deleting note:', response.status);
    }
}

// Call this to load notes on page load
fetchNotes();
