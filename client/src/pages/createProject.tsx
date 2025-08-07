import axios from "axios";
import React, { useState, useEffect } from "react";

function CreateProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:3000/createProject",
        { title, description },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("Project created:", response.data);
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  };
  return (
    <>
      <h1>Create Project</h1>
      <main>
        <form onSubmit={handleCreate}>
          <fieldset>
            <legend>Create new project</legend>
            <label htmlFor="title">
              <small>Title</small>
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label htmlFor="description">
              <small>Description</small>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                name="description"
                autoComplete="off"
              ></textarea>
            </label>
            <br />
            <button type="submit">Create</button>
          </fieldset>
        </form>
      </main>
    </>
  );
}
export default CreateProject;
