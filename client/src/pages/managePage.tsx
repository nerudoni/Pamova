import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./managePage.module.css";

interface Project {
  projectID: number;
  project_name: string;
  description: string;
  client: string;
  country: string;
  address: string;
  status: "ongoing" | "complete";
  draft: boolean;
  start_date: string;
  end_date?: string;
}

interface Image {
  id: number;
  image_url: string;
  projectID: number;
}

const ManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [project_name, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"ongoing" | "complete">("ongoing");
  const [draft, setDraft] = useState(false);
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("project_name", project_name);
      formData.append("description", description);
      formData.append("client", client);
      formData.append("country", country);
      formData.append("address", address);
      formData.append("status", status);
      formData.append("draft", draft.toString());
      formData.append("start_date", start_date);
      formData.append("end_date", status === "complete" ? end_date : "");

      // Append images to delete
      imagesToDelete.forEach((id) => {
        formData.append("imagesToDelete", id.toString());
      });

      // Append new files
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.put(
        `http://localhost:3000/projects/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Project updated:", response.data);
      alert("Project updated successfully!");
      navigate(`/timeline/${id}`);
    } catch (error) {
      console.error("Error updating project:", error);
      setError("Error updating project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, imagesRes] = await Promise.all([
          axios.get(`http://localhost:3000/manage/${id}`),
          axios.get(`http://localhost:3000/projects/${id}/images`),
        ]);

        setProject(projectRes.data);
        setImages(imagesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load project data.");
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (project) {
      setProjectName(project.project_name);
      setDescription(project.description);
      setClient(project.client);
      setCountry(project.country);
      setAddress(project.address);
      setStatus(project.status);
      setDraft(project.draft);
      setStartDate(project.start_date);
      setEndDate(project.end_date || "");
    }
  }, [project]);

  // Handle year-only inputs
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    if (year && year.length === 4) {
      setStartDate(`${year}-01-01`);
    } else {
      setStartDate(year);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    if (year && year.length === 4) {
      setEndDate(`${year}-12-31`);
    } else {
      setEndDate(year);
    }
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear().toString();
  };

  if (!project && !error)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading project details...</p>
      </div>
    );

  return (
    <div className={styles.managePage}>
      <div className={styles.manageContainer}>
        <header className={styles.manageHeader}>
          <h1 className={styles.manageTitle}>Edit Project</h1>
          <p className={styles.projectId}>Project ID: {id}</p>
        </header>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <main className={styles.manageMain}>
          <form onSubmit={handleEdit} className={styles.projectForm}>
            <fieldset className={styles.formFieldset}>
              <legend className={styles.formLegend}>Project Details</legend>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="project_name" className={styles.formLabel}>
                    Project Name
                  </label>
                  <input
                    id="project_name"
                    name="project_name"
                    type="text"
                    value={project_name}
                    onChange={(e) => setProjectName(e.target.value)}
                    autoComplete="off"
                    required
                    minLength={4}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="client" className={styles.formLabel}>
                    Client
                  </label>
                  <input
                    id="client"
                    name="client"
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    autoComplete="off"
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="country" className={styles.formLabel}>
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    autoComplete="off"
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address" className={styles.formLabel}>
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="off"
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.formLabel}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ongoing" | "complete")
                    }
                    className={styles.formSelect}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="start_date" className={styles.formLabel}>
                    Start Year
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="number"
                    min="1900"
                    max="2100"
                    value={start_date ? formatYear(start_date) : ""}
                    onChange={handleStartDateChange}
                    required
                    className={styles.formInput}
                  />
                </div>

                {status === "complete" && (
                  <div className={styles.formGroup}>
                    <label htmlFor="end_date" className={styles.formLabel}>
                      End Year
                      <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      id="end_date"
                      name="end_date"
                      type="number"
                      min="1900"
                      max="2100"
                      value={end_date ? formatYear(end_date) : ""}
                      onChange={handleEndDateChange}
                      required={status === "complete"}
                      className={styles.formInput}
                    />
                  </div>
                )}

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="description" className={styles.formLabel}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    name="description"
                    autoComplete="off"
                    required
                    className={styles.formTextarea}
                    rows={4}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                  <label htmlFor="draft" className={styles.checkboxLabel}>
                    <input
                      id="draft"
                      name="draft"
                      type="checkbox"
                      checked={draft}
                      onChange={(e) => setDraft(e.target.checked)}
                      className={styles.formCheckbox}
                    />
                    <span className={styles.checkmark}></span>
                    Save as Draft
                  </label>
                </div>
              </div>

              {/* Current Images Section */}
              <div className={styles.imagesSection}>
                <h3 className={styles.sectionTitle}>Current Images</h3>
                {images.length > 0 ? (
                  <div className={styles.imagesGrid}>
                    {images.map((img) => {
                      const isMarkedForDeletion = imagesToDelete.includes(
                        img.id
                      );

                      return (
                        <div
                          key={img.id}
                          className={`${styles.imageItem} ${
                            isMarkedForDeletion ? styles.markedForDeletion : ""
                          }`}
                        >
                          <div className={styles.imageContainer}>
                            <img
                              src={`http://localhost:3000${img.image_url}`}
                              alt={`Project ${project.project_name}`}
                              className={styles.projectImage}
                            />
                            <div className={styles.imageOverlay}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isMarkedForDeletion) {
                                    setImagesToDelete((prev) =>
                                      prev.filter(
                                        (imageId) => imageId !== img.id
                                      )
                                    );
                                  } else {
                                    setImagesToDelete((prev) => [
                                      ...prev,
                                      img.id,
                                    ]);
                                  }
                                }}
                                className={`${styles.imageActionBtn} ${
                                  isMarkedForDeletion
                                    ? styles.undo
                                    : styles.remove
                                }`}
                              >
                                {isMarkedForDeletion ? "Undo" : "Remove"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.noImages}>No images for this project.</p>
                )}
              </div>

              {/* Add new images section */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="images" className={styles.formLabel}>
                  Add New Images
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                  className={styles.fileInput}
                />
                {files.length > 0 && (
                  <div className={styles.selectedFiles}>
                    <small>{files.length} file(s) selected</small>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Project"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => navigate(`/timeline/${id}`)}
                >
                  View Timeline
                </button>
              </div>
            </fieldset>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ManagePage;
