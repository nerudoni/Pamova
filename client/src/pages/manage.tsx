import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Project {
  projectID: number; // Changed from id
  project_name: string; // Changed from title
  status: string;
  draft: boolean;
  client: string;
  country: string;
}

function Manage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/projects")
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, []);

  const handleDeleteProject = async (projectID: number) => {
    try {
      console.log("accessed");
      axios.delete(`http://localhost:3000/deleteProject/${projectID}`, {
        withCredentials: true,
      });
      setProjects(
        projects.filter((project) => project.projectID !== projectID)
      );
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <>
      <h1>Hi Manage Projects!</h1>
      <a href="./createProject">Create new project</a>

      {projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.projectID}>
              <Link to={`/manage/${project.projectID}`}>
                <h2>{project.project_name}</h2>
              </Link>
              <p>Status: {project.status}</p>
              <p>Client: {project.client}</p>
              <p>Country: {project.country}</p>
              <p>Draft: {project.draft ? "Yes" : "No"}</p>
              <button onClick={() => handleDeleteProject(project.projectID)}>
                X
              </button>
            </li>
          ))}{" "}
        </ul>
      ) : (
        <p>No projects yet</p>
      )}
    </>
  );
}
export default Manage;
