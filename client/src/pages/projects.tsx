import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Project {
  id: number;
  title: string;
}
function Projects() {
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

  return (
    <>
      <h1>Projects</h1>
      {projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>
                <h2>{project.title}</h2>
              </Link>
            </li>
          ))}{" "}
        </ul>
      ) : (
        <p>No projects yet</p>
      )}
    </>
  );
}

export default Projects;
