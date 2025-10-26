import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();

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

    axios
      .put(`http://localhost:3000/projects/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Project updated:", response.data);
        alert("Project updated successfully!");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating project:", error);
        alert("Error updating project");
      });
  };

  useEffect(() => {
    axios
      .get(`http://localhost:3000/manage/${id}`)
      .then((res) => {
        setProject(res.data);
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
      });

    axios
      .get(`http://localhost:3000/projects/${id}/images`)
      .then((res) => {
        setImages(res.data);
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
      });
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
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  if (!project) return <p>Loading...</p>;

  return (
    <>
      {/* Edit Form Section */}
      <div>
        <h1>Edit Project</h1>
        <main>
          <form onSubmit={handleEdit}>
            <fieldset>
              <legend>Edit project</legend>

              <label htmlFor="project_name">
                <small>Project Name</small>
                <input
                  id="project_name"
                  name="project_name"
                  type="text"
                  value={project_name}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoComplete="off"
                  required
                  minLength={4}
                />
              </label>

              <label htmlFor="description">
                <small>Description</small>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  name="description"
                  autoComplete="off"
                  required
                />
              </label>

              <label htmlFor="client">
                <small>Client</small>
                <input
                  id="client"
                  name="client"
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  autoComplete="off"
                  required
                />
              </label>

              <label htmlFor="country">
                <small>Country</small>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="off"
                  required
                />
              </label>

              <label htmlFor="address">
                <small>Address</small>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="off"
                  required
                />
              </label>

              <label htmlFor="status">
                <small>Status</small>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ongoing" | "complete")
                  }
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="complete">Complete</option>
                </select>
              </label>

              <label htmlFor="start_date">
                <small>Start Year</small>
                <input
                  id="start_date"
                  name="start_date"
                  type="number"
                  min="1900"
                  max="2100"
                  value={start_date ? formatYear(start_date) : ""}
                  onChange={handleStartDateChange}
                  required
                />
              </label>

              {status === "complete" && (
                <label htmlFor="end_date">
                  <small>End Year (required for completed projects)</small>
                  <input
                    id="end_date"
                    name="end_date"
                    type="number"
                    min="1900"
                    max="2100"
                    value={end_date ? formatYear(end_date) : ""}
                    onChange={handleEndDateChange}
                    required={status === "complete"}
                  />
                </label>
              )}

              <label
                htmlFor="draft"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <small>Draft</small>
                <input
                  id="draft"
                  name="draft"
                  type="checkbox"
                  checked={draft}
                  onChange={(e) => setDraft(e.target.checked)}
                />
              </label>

              {/* Current Images Section */}
              <div id="images-div">
                <h3>Current Images</h3>
                {images.length > 0 ? (
                  images.map((img) => {
                    const isMarkedForDeletion = imagesToDelete.includes(img.id);

                    return (
                      <div
                        key={img.id}
                        style={{
                          display: "inline-block",
                          margin: "10px",
                          opacity: isMarkedForDeletion ? 0.5 : 1,
                        }}
                      >
                        <img
                          src={`http://localhost:3000${img.image_url}`}
                          alt={`Project ${project.project_name}`}
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            border: isMarkedForDeletion
                              ? "2px solid red"
                              : "none",
                          }}
                        />
                        <br />
                        <button
                          type="button"
                          onClick={() => {
                            if (isMarkedForDeletion) {
                              setImagesToDelete((prev) =>
                                prev.filter((imageId) => imageId !== img.id)
                              );
                            } else {
                              setImagesToDelete((prev) => [...prev, img.id]);
                            }
                          }}
                          style={{
                            color: isMarkedForDeletion ? "green" : "red",
                          }}
                        >
                          {isMarkedForDeletion ? "Undo Remove" : "Remove"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p>No images for this project.</p>
                )}
              </div>

              {/* Add new images section */}
              <label htmlFor="images">
                <small>Add New Images</small>
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </label>

              <button type="submit">Update Project</button>
            </fieldset>
          </form>
        </main>
        <a href={`/timeline/${id}`}>Go to Timeline Page</a>
      </div>
    </>
  );
};

export default ManagePage;
