// Projects.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./projects.module.css";

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
    <div className={styles.projectsContainer}>
      <h1 className={styles.pageTitle}>Projects</h1>

      {projects.length > 0 ? (
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <Link
                to={`/projects/${project.id}`}
                className={styles.projectLink}
              >
                <div className={styles.projectImage}>
                  {/* Placeholder for project image */}
                </div>
                <div className={styles.projectInfo}>
                  <h2 className={styles.projectTitle}>{project.title}</h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noProjects}>No projects yet</p>
      )}
    </div>
  );
}

export default Projects;
