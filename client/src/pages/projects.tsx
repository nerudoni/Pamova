// Projects.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./projects.module.css";

interface Project {
  projectID: number; // Changed from id
  project_name: string; // Changed from title
  client: string;
  country: string; // Changed from location
  status: string;
  draft: boolean;
  start_date: string;
  end_date?: string;
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "project_name" | "client" | "country" | "status"
  >("project_name");
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
          project.project_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (project.client &&
            project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (project.country &&
            project.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
          project.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    results = [...results].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "project_name") {
        comparison = a.project_name.localeCompare(b.project_name);
      } else if (sortBy === "client") {
        comparison = (a.client || "").localeCompare(b.client || "");
      } else if (sortBy === "country") {
        comparison = (a.country || "").localeCompare(b.country || "");
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      }

      // Reverse if descending order
      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredProjects(results);
  }, [searchTerm, projects, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Format year from date string
  const formatYear = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  return (
    <div className={styles.projectsContainer}>
      <h1 className={styles.pageTitle}>Projects</h1>

      {/* Search and Sort Controls */}
      <div className={styles.controlsContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search projects by name, client, country, or status..."
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
            <option value="project_name">Name</option>
            <option value="client">Client</option>
            <option value="country">Country</option>
            <option value="status">Status</option>
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
            <div key={project.projectID} className={styles.projectCard}>
              <Link
                to={`/projects/${project.projectID}`}
                className={styles.projectLink}
              >
                <div className={styles.projectImage}>
                  {/* Placeholder for project image */}
                  <div
                    className={styles.projectStatus}
                    data-status={project.status}
                  >
                    {project.status}
                  </div>
                  {project.draft && (
                    <div className={styles.draftBadge}>Draft</div>
                  )}
                </div>
                <div className={styles.projectInfo}>
                  <h2 className={styles.projectTitle}>
                    {project.project_name}
                  </h2>
                  {project.client && (
                    <p className={styles.projectClient}>
                      Client: {project.client}
                    </p>
                  )}
                  {project.country && (
                    <p className={styles.projectLocation}>
                      Country: {project.country}
                    </p>
                  )}
                  <p className={styles.projectYears}>
                    {formatYear(project.start_date)}
                    {project.end_date && ` - ${formatYear(project.end_date)}`}
                  </p>
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
