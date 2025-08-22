import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Project {
  id: number;
  title: string;
  description: string;
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
  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <div id="images-div">
        {images.length > 0 ? (
          images.map((img) => (
            <img
              key={img.id}
              src={`http://localhost:3000${img.image_url}`}
              alt={`Project ${project.title}`}
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
