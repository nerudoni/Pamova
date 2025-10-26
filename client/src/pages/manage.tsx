// Manage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./Manage.module.css";

interface Project {
  projectID: number;
  project_name: string;
  status: string;
  draft: boolean;
  client: string;
  country: string;
}

function Manage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/projects")
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setLoading(false);
      });
  }, []);

  const handleDeleteProject = async (projectID: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/deleteProject/${projectID}`, {
        withCredentials: true,
      });
      setProjects(
        projects.filter((project) => project.projectID !== projectID)
      );
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Error deleting project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className={styles.manageContainer}>
      {/* Header */}
      <header className={styles.manageHeader}>
        <div className={styles.headerContent}>
          <h1>Manage Projects</h1>
          <p>Edit and manage your construction projects</p>
        </div>
        <Link to="/createProject" className={styles.createButton}>
          Create New Project
        </Link>
      </header>

      {/* Projects List */}
      <section className={styles.projectsSection}>
        {projects.length > 0 ? (
          <div className={styles.projectsList}>
            {projects.map((project) => (
              <div key={project.projectID} className={styles.projectCard}>
                <div className={styles.projectInfo}>
                  <Link
                    to={`/manage/${project.projectID}`}
                    className={styles.projectLink}
                  >
                    <h3 className={styles.projectTitle}>
                      {project.project_name}
                    </h3>
                  </Link>
                  <div className={styles.projectMeta}>
                    {project.draft && (
                      <span className={styles.draftBadge}>DRAFT</span>
                    )}
                    <span className={styles.statusBadge}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className={styles.projectActions}>
                  <Link
                    to={`/manage/${project.projectID}`}
                    className={styles.editButton}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.projectID)}
                    className={styles.deleteButton}
                    title="Delete Project"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noProjects}>
            <div className={styles.noProjectsIcon}>📋</div>
            <h3>No Projects Yet</h3>
            <p>Get started by creating your first project</p>
            <Link to="/createProject" className={styles.createButton}>
              Create Your First Project
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default Manage;
