// Projects.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./projects.module.css";

interface Project {
  id: number;
  title: string;
  client: string;
  location: string;
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "client" | "location">(
    "title"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    axios
      .get("http://localhost:3000/projects")
      .then((res) => {
        setProjects(res.data);
        setFilteredProjects(res.data);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, []);

  // Search and sort algorithm
  useEffect(() => {
    let results = projects;

    // Search filter
    if (searchTerm.trim()) {
      results = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.client &&
            project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (project.location &&
            project.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sorting
    results = [...results].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "client") {
        comparison = (a.client || "").localeCompare(b.client || "");
      } else if (sortBy === "location") {
        comparison = (a.location || "").localeCompare(b.location || "");
      }

      // Reverse if descending order
      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredProjects(results);
  }, [searchTerm, projects, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={styles.projectsContainer}>
      <h1 className={styles.pageTitle}>Projects</h1>

      {/* Search and Sort Controls */}
      <div className={styles.controlsContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search projects by title, client, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortContainer}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="title">Title</option>
            <option value="client">Client</option>
            <option value="location">Location</option>
          </select>

          <button
            onClick={toggleSortOrder}
            className={`${styles.sortButton} ${styles[sortOrder]}`}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>

        {searchTerm && (
          <p className={styles.searchResults}>
            Found {filteredProjects.length} project
            {filteredProjects.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {filteredProjects.length > 0 ? (
        <div className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
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
                  {project.client && (
                    <p className={styles.projectClient}>
                      Client: {project.client}
                    </p>
                  )}
                  {project.location && (
                    <p className={styles.projectLocation}>
                      Location: {project.location}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noProjects}>
          {searchTerm ? "No projects match your search" : "No projects yet"}
        </p>
      )}
    </div>
  );
}

export default Projects;
