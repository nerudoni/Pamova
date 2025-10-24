import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Project {
  id: number;
  title: string;
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

  const handleDeleteProject = async (projectId: number) => {
    try {
      console.log("accessed");
      axios.delete(`http://localhost:3000/deleteProject/${projectId}`, {
        withCredentials: true,
      });
      setProjects(projects.filter((project) => project.id !== projectId));
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
            <li key={project.id}>
              <Link to={`/manage/${project.id}`}>
                <h2>{project.title}</h2>
              </Link>
              <button onClick={() => handleDeleteProject(project.id)}>X</button>
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
