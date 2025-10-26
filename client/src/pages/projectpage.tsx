// ProjectPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./projectPage.module.css";

interface Project {
  projectID: number;
  project_name: string;
  description: string;
  client: string;
  country: string;
  address: string;
  status: string;
  draft: boolean;
  start_date: string;
  end_date?: string;
}

interface Image {
  id: number;
  image_url: string;
  projectID: number;
}

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const [projectRes, imagesRes] = await Promise.all([
          axios.get(`http://localhost:3000/projects/${id}`),
          axios.get(`http://localhost:3000/projects/${id}/images`),
        ]);

        setProject(projectRes.data);
        setImages(imagesRes.data);
      } catch (err) {
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
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
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.errorContainer}>
        <h2>Project Not Found</h2>
        <p>The requested project could not be loaded.</p>
        <a href="/projects" className={styles.backButton}>
          ← Back to Projects
        </a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Navigation */}
      <div className={styles.backNavigation}>
        <a href="/projects" className={styles.backLink}>
          ← Back to All Projects
        </a>
      </div>

      {/* Project Header */}
      <header className={styles.projectHeader}>
        <div className={styles.projectMeta}>
          {project.draft && <span className={styles.draftBadge}>DRAFT</span>}
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(project.status) }}
          >
            {project.status.toUpperCase()}
          </span>
          <span className={styles.projectYear}>
            {formatYear(project.start_date)}
            {project.end_date && ` - ${formatYear(project.end_date)}`}
          </span>
        </div>
        <h1 className={styles.projectTitle}>{project.project_name}</h1>
        <p className={styles.projectClient}>For {project.client}</p>
      </header>

      {/* Hero Image */}
      {images.length > 0 && (
        <div className={styles.heroSection}>
          <div className={styles.heroImageContainer}>
            <img
              src={`http://localhost:3000${images[0].image_url}`}
              alt={project.project_name}
              className={styles.heroImage}
            />
          </div>
        </div>
      )}

      {/* Project Details Grid */}
      <div className={styles.detailsGrid}>
        <div className={styles.descriptionSection}>
          <h2>Project Overview</h2>
          <p className={styles.projectDescription}>{project.description}</p>

          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>
                {project.address}, {project.country}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Timeline</span>
              <span className={styles.detailValue}>
                {formatYear(project.start_date)}
                {project.end_date
                  ? ` - ${formatYear(project.end_date)}`
                  : " - Present"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailValue}>
                <span
                  className={styles.statusIndicator}
                  style={{ backgroundColor: getStatusColor(project.status) }}
                ></span>
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className={styles.gallerySection}>
            <h2>Project Gallery</h2>
            <div className={styles.galleryContainer}>
              <div className={styles.carousel}>
                <div className={styles.carouselImageContainer}>
                  <img
                    src={`http://localhost:3000${images[currentImageIndex].image_url}`}
                    alt={`${project.project_name} - Image ${
                      currentImageIndex + 1
                    }`}
                    className={styles.carouselImage}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        className={`${styles.carouselButton} ${styles.prevButton}`}
                        onClick={prevImage}
                        aria-label="Previous image"
                      >
                        ←
                      </button>
                      <button
                        className={`${styles.carouselButton} ${styles.nextButton}`}
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className={styles.carouselIndicators}>
                    <span className={styles.imageCounter}>
                      {currentImageIndex + 1} / {images.length}
                    </span>
                    <div className={styles.thumbnailStrip}>
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`${styles.thumbnail} ${
                            index === currentImageIndex
                              ? styles.activeThumbnail
                              : ""
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No Images Message */}
      {images.length === 0 && (
        <div className={styles.noImages}>
          <div className={styles.noImagesIcon}>📷</div>
          <h3>No Images Available</h3>
          <p>Project visuals will be added soon.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
