import React, { useState, useEffect } from "react";
import "./App.css";
import { API } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";

const initialFormState = { name: "", description: "" };

function App() {
  const [notes, setNotes] = useState([]);
  const [notesBeingDeleted, setNotesBeingDeleted] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: queries.listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    const name = formData.name,
      description = formData.description;
    await API.graphql({
      query: mutations.createNote,
      variables: { input: { name, description } },
    });
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    setNotesBeingDeleted(notes.filter((note) => note.id === id));
    console.log("deleting note", id);
    await API.graphql({
      query: mutations.deleteNote,
      variables: { input: { id } },
    });
    console.log("deleted note");
    const newNotesArray = notes.filter((note) => note.id !== id);
    setNotes(newNotesArray);
    setNotesBeingDeleted([]);
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <h1>
            Notes App for <code>{user.username}</code>
          </h1>
          <input
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Note name"
            value={formData.name}
            style={{ marginRight: "1em" }}
          />
          <input
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Note description"
            value={formData.description}
            style={{ marginRight: "1em" }}
          />
          <button onClick={createNote}>Create Note</button>
          <table>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <th
                    style={
                      notesBeingDeleted.includes(note)
                        ? { color: "#666666" }
                        : { color: "#000000" }
                    }
                  >
                    {note.name}
                  </th>
                  <th>{note.description}</th>
                  <th>
                    <button onClick={() => deleteNote(note)}>
                      Delete note
                    </button>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
