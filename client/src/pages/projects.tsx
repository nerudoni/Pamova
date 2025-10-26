// Projects.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./Projects.module.css";

interface Project {
  projectID: number;
  project_name: string;
  start_date: string;
  end_date?: string;
  status: string;
  draft: boolean;
}

interface ProjectImage {
  id: number;
  image_url: string;
  projectID: number;
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<{ [key: number]: string }>(
    {}
  );
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"project_name" | "year">("project_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsRes = await axios.get("http://localhost:3000/projects");
        const projectsData = projectsRes.data;

        setProjects(projectsData);
        setFilteredProjects(projectsData);

        // Fetch first image for each project
        const imagesMap: { [key: number]: string } = {};
        await Promise.all(
          projectsData.map(async (project: Project) => {
            try {
              const imagesRes = await axios.get(
                `http://localhost:3000/projects/${project.projectID}/images`
              );
              if (imagesRes.data.length > 0) {
                imagesMap[project.projectID] = imagesRes.data[0].image_url;
              }
            } catch (err) {
              console.error(
                `Error fetching images for project ${project.projectID}:`,
                err
              );
            }
          })
        );

        setProjectImages(imagesMap);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search and sort algorithm
  useEffect(() => {
    let results = projects;

    // Search filter
    if (searchTerm.trim()) {
      results = projects.filter((project) =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    results = [...results].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "project_name") {
        comparison = a.project_name.localeCompare(b.project_name);
      } else if (sortBy === "year") {
        const yearA = new Date(a.start_date).getFullYear();
        const yearB = new Date(b.start_date).getFullYear();
        comparison = yearA - yearB;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredProjects(results);
  }, [searchTerm, projects, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#48d1cc";
      case "ongoing":
        return "#b08d57";
      case "planned":
        return "#f8f7f4";
      default:
        return "#2a2d32";
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
    <div className={styles.projectsContainer}>
      {/* Header Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.pageTitle}>Project Portfolio</h1>
          <p className={styles.pageSubtitle}>
            Showcasing our strategic infrastructure developments
          </p>
        </div>
      </section>

      {/* Controls Section */}
      <section className={styles.controlsSection}>
        <div className={styles.container}>
          <div className={styles.controlsContainer}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.sortContainer}>
              <span className={styles.sortLabel}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={styles.sortSelect}
              >
                <option value="project_name">Project Name</option>
                <option value="year">Year</option>
              </select>

              <button
                onClick={toggleSortOrder}
                className={`${styles.sortButton} ${styles[sortOrder]}`}
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {searchTerm && (
            <div className={styles.searchResults}>
              Found {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </div>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className={styles.projectsSection}>
        <div className={styles.container}>
          {filteredProjects.length > 0 ? (
            <div className={styles.projectsGrid}>
              {filteredProjects.map((project) => (
                <div key={project.projectID} className={styles.projectCard}>
                  <Link
                    to={`/projects/${project.projectID}`}
                    className={styles.projectLink}
                  >
                    {/* Project Image */}
                    <div className={styles.projectImage}>
                      {projectImages[project.projectID] ? (
                        <img
                          src={`http://localhost:3000${
                            projectImages[project.projectID]
                          }`}
                          alt={project.project_name}
                          className={styles.projectImage}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <div className={styles.placeholderIcon}>🏗️</div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: getStatusColor(project.status),
                        }}
                      >
                        {project.status.toUpperCase()}
                      </div>

                      {/* Draft Badge */}
                      {project.draft && (
                        <div className={styles.draftBadge}>DRAFT</div>
                      )}

                      {/* Year Overlay */}
                      <div className={styles.yearOverlay}>
                        {formatYear(project.start_date)}
                        {project.end_date &&
                          ` - ${formatYear(project.end_date)}`}
                        {!project.end_date &&
                          project.status === "ongoing" &&
                          " - Present"}
                      </div>
                    </div>

                    {/* Project Title */}
                    <div className={styles.projectInfo}>
                      <h3 className={styles.projectTitle}>
                        {project.project_name}
                      </h3>
                      <div className={styles.projectArrow}>
                        <span className={styles.arrowIcon}>→</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noProjects}>
              <div className={styles.noProjectsIcon}>📋</div>
              <h3>No Projects Found</h3>
              <p>
                {searchTerm
                  ? "No projects match your search. Try different keywords."
                  : "No projects are currently available."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={styles.clearSearchButton}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Projects;
