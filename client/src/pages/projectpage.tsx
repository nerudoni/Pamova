import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Project {
  id: number;
  title: string;
  description: string;
}

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/projects/${id}`)
      .then((res) => {
        setProject(res.data);
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
      });
  }, [id]);

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
    </div>
  );
};
export default ProjectPage;
