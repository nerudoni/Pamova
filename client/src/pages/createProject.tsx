import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CreateProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        if (!res.data.loggedIn) {
          navigate("/login");
        }
      });
  }, []);
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("client", client);
    formData.append("location", location);
    files.forEach((file) => formData.append("images", file));

    axios
      .post("http://localhost:3000/createProject", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
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
            <label htmlFor="location">
              <small>Location</small>
              <input
                id="location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label htmlFor="client">
              <small>Client</small>
              <input
                id="client"
                name="client"
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                autoComplete="off"
              />
            </label>

            <br />
            <label htmlFor="images">
              <small>Upload images</small>
              <input
                type="file"
                name="images"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>
            <button type="submit">Create</button>
          </fieldset>
        </form>
      </main>
    </>
  );
}
export default CreateProject;
