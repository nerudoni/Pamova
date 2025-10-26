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

  useEffect(() => {
    axios
      .get(`http://localhost:3000/projects/${id}`)
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

  const formatYear = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h1>{project.project_name}</h1>
      {project.draft && (
        <div
          style={{
            background: "#ffeb3b",
            padding: "5px",
            display: "inline-block",
          }}
        >
          DRAFT
        </div>
      )}
      <p>
        Status: <strong>{project.status.toUpperCase()}</strong>
      </p>
      <p>{project.description}</p>
      <p>
        <strong>Client:</strong> {project.client}
      </p>
      <p>
        <strong>Country:</strong> {project.country}
      </p>
      <p>
        <strong>Address:</strong> {project.address}
      </p>
      <p>
        <strong>Timeline:</strong> {formatYear(project.start_date)}
        {project.end_date && ` - ${formatYear(project.end_date)}`}
        {!project.end_date && project.status === "ongoing" && " (Ongoing)"}
      </p>

      <div id="images-div">
        {images.length > 0 ? (
          images.map((img) => (
            <img
              key={img.id}
              src={`http://localhost:3000${img.image_url}`}
              alt={`Project ${project.project_name}`}
              style={{ maxWidth: "300px", margin: "10px" }}
            />
          ))
        ) : (
          <p>No images for this project.</p>
        )}
      </div>
    </div>
  );
};
export default ProjectPage;
