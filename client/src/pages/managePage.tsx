import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Project {
  id: number;
  title: string;
  description: string;
  client: string;
  location: string;
}

interface Image {
  id: number;
  image_url: string;
  projectID: number;
}

const ManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();

    axios
      .put(
        `http://localhost:3000/projects/${id}`,
        {
          title,
          description,
          client,
          location,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        console.log("Project updated:", response.data);
        alert("Project updated successfully!");
        // Optionally refresh the project data
        setProject((prev) =>
          prev ? { ...prev, title, description, client, location } : null
        );
      })
      .catch((error) => {
        console.error("Error updating project:", error);
        alert("Error updating project");
      });
  };
  useEffect(() => {
    axios
      .get(`http://localhost:3000/manage/${id}`)
      .then((res) => {
        setProject(res.data);
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
      });

    axios
      .get(`http://localhost:3000/projects/${id}/images`)
      .then((res) => {
        setImages(res.data);
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
      });
  }, [id]);
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setClient(project.client);
      setLocation(project.location);
    }
  }, [project]); // This runs whenever 'project' changes from null to having data
  if (!project) return <p>Loading...</p>;

  return (
    <>
      {
        //for preview
      }
      <div>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <p>Client: {project.client}</p>
        <p>Location: {project.location}</p>
        <div id="images-div">
          {images.length > 0 ? (
            images.map((img) => (
              <img
                key={img.id}
                src={`http://localhost:3000${img.image_url}`}
                alt={`Project ${project.title}`}
              />
            ))
          ) : (
            <p>No images for this project.</p>
          )}
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
            placeholder={project ? project.title : ""}
          />
        </div>
      </div>
      <>
        <h1>Edit Project</h1>
        <main>
          <form onSubmit={handleEdit}>
            <fieldset>
              <legend>Edit project</legend>
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
                >
                  {project ? project.description : ""}
                </textarea>
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
              <button type="submit">Update</button>
            </fieldset>
          </form>
        </main>
      </>
    </>
  );
};

export default ManagePage;
/*function CreateProject() {
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
      <h1>Edit Project</h1>
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
                placeholder={project ? project.title : ""}
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
}*/
