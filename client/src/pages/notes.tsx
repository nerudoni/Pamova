import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./notes.module.css";

axios.defaults.withCredentials = true;

interface User {
  id: number;
  username: string;
  email: string;
}

interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  priority: "Low" | "Medium" | "High";
  is_done: boolean;
  created_at: string;
  author_username: string;
  shared_with_me: number | null;
  can_edit_shared: boolean;
  shared_with_users: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    shared_with: [] as number[],
    can_edit: false,
  });
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchUsers();
  }, []);

  const fetchNotes = () => {
    axios
      .get("http://localhost:3000/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => {
        console.error("Error fetching notes:", err);
        if (err.response) {
          console.error(
            "Status:",
            err.response.status,
            "Data:",
            err.response.data
          );
        }
      });
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:3000/users")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/notes", newNote)
      .then(() => {
        setNewNote({
          title: "",
          content: "",
          priority: "Medium",
          shared_with: [],
          can_edit: false,
        });
        fetchNotes();
      })
      .catch((err) => {
        console.error("Error adding note:", err);
        if (err.response) console.error(err.response.status, err.response.data);
      });
  };

  const toggleDone = (noteId: number, currentStatus: boolean) => {
    axios
      .put(`http://localhost:3000/notes/${noteId}`, { is_done: !currentStatus })
      .then(fetchNotes)
      .catch((err) => {
        console.error("Error toggling note:", err);
        if (err.response) console.error(err.response.status, err.response.data);
      });
  };

  const deleteNote = (noteId: number) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      axios
        .delete(`http://localhost:3000/notes/${noteId}`)
        .then(fetchNotes)
        .catch((err) => {
          console.error("Error deleting note:", err);
          if (err.response)
            console.error(err.response.status, err.response.data);
        });
    }
  };

  const openShareDialog = (note: Note) => {
    setSelectedNote(note);
    setShowShareDialog(true);
  };

  const updateNoteSharing = (sharedWith: number[], canEdit: boolean) => {
    if (!selectedNote) return;

    axios
      .put(`http://localhost:3000/notes/${selectedNote.id}`, {
        shared_with: sharedWith,
        can_edit: canEdit,
      })
      .then(() => {
        setShowShareDialog(false);
        setSelectedNote(null);
        fetchNotes();
      })
      .catch(console.error);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "#ff6b6b";
      case "Medium":
        return "#ffd93d";
      case "Low":
        return "#6bcf7f";
      default:
        return "#c0c0c0";
    }
  };

  const isNoteOwner = (note: Note) => {
    // This would need to be implemented based on your auth context
    // For now, using a simple check - you'll need to replace this
    return !note.shared_with_me;
  };

  return (
    <div className={styles.notesContainer}>
      <h1>My Notes 📝</h1>

      {/* Add Note Form */}
      <form onSubmit={addNote} className={styles.noteForm}>
        <input
          type="text"
          placeholder="Note title..."
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Write your note here..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          required
        />
        <div className={styles.formOptions}>
          <select
            value={newNote.priority}
            onChange={(e) =>
              setNewNote({ ...newNote, priority: e.target.value as any })
            }
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={newNote.can_edit}
              onChange={(e) =>
                setNewNote({ ...newNote, can_edit: e.target.checked })
              }
            />
            Allow editing when shared
          </label>

          <button type="submit">Add Note</button>
        </div>

        {/* Share with users dropdown */}
        <div className={styles.shareSection}>
          <label>Share with:</label>
          <select
            multiple
            value={newNote.shared_with.map(String)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) =>
                Number(option.value)
              );
              setNewNote({ ...newNote, shared_with: selected });
            }}
            className={styles.userSelect}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
          <small>Hold Ctrl/Cmd to select multiple users</small>
        </div>
      </form>

      {/* Notes Grid */}
      <div className={styles.notesGrid}>
        {notes.map((note) => (
          <div
            key={note.id}
            className={`${styles.note} ${note.is_done ? styles.done : ""} ${
              note.shared_with_me ? styles.sharedNote : ""
            }`}
            style={{ borderTopColor: getPriorityColor(note.priority) }}
          >
            <div className={styles.noteHeader}>
              <h3>{note.title}</h3>
              <div className={styles.noteMeta}>
                {note.shared_with_me && (
                  <span className={styles.shared}>
                    👥 Shared by {note.author_username}
                  </span>
                )}
                {!note.shared_with_me && note.shared_with_users && (
                  <span className={styles.shared}>
                    👥 Shared with: {note.shared_with_users}
                  </span>
                )}
                {!note.shared_with_me && (
                  <span className={styles.author}>
                    by {note.author_username}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.noteContent}>{note.content}</div>

            <div className={styles.noteActions}>
              <button
                onClick={() => toggleDone(note.id, note.is_done)}
                className={styles.doneBtn}
                disabled={!!note.shared_with_me && !note.can_edit_shared}
              >
                {note.is_done ? "✅ Done" : "⬜ Mark Done"}
              </button>

              {isNoteOwner(note) && (
                <>
                  <button
                    onClick={() => openShareDialog(note)}
                    className={styles.shareBtn}
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className={styles.deleteBtn}
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>

            <div className={styles.noteFooter}>
              <span
                className={styles.priority}
                style={{ color: getPriorityColor(note.priority) }}
              >
                {note.priority} Priority
              </span>
              <span className={styles.date}>
                {new Date(note.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Share Dialog */}
      {showShareDialog && selectedNote && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Share "{selectedNote.title}"</h3>
            <div className={styles.shareOptions}>
              <label>
                <strong>Share with:</strong>
                <select multiple className={styles.userSelect}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <input type="checkbox" />
                Allow recipients to edit this note
              </label>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowShareDialog(false)}>Cancel</button>
              <button onClick={() => updateNoteSharing([], false)}>
                Update Sharing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
