import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./TimelinePage.module.css";

interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "in_progress" | "completed";
}

const TimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );

  useEffect(() => {
    fetchMilestones();
  }, [id]);

  const fetchMilestones = () => {
    axios
      .get(`http://localhost:3000/projects/${id}/milestones`)
      .then((res) => {
        const sorted = res.data.sort(
          (a: Milestone, b: Milestone) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        setMilestones(sorted);
      })
      .catch(console.error);
  };

  const addMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/milestones", {
        project_id: id,
        ...newMilestone,
      })
      .then(() => {
        setNewMilestone({ title: "", description: "", due_date: "" });
        fetchMilestones();
      })
      .catch(console.error);
  };

  const updateStatus = (milestoneId: number, status: Milestone["status"]) => {
    axios
      .put(`http://localhost:3000/milestones/${milestoneId}`, { status })
      .then(fetchMilestones)
      .catch(console.error);
  };

  const deleteMilestone = (milestoneId: number) => {
    axios
      .delete(`http://localhost:3000/milestones/${milestoneId}`)
      .then(() => {
        fetchMilestones();
        if (selectedMilestone?.id === milestoneId) {
          setSelectedMilestone(null);
        }
      })
      .catch(console.error);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "in_progress":
        return "#FF9800";
      default:
        return "#f44336";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.timelineContainer}>
      <h1>Project Timeline</h1>

      {/* Add Milestone Form */}
      <form onSubmit={addMilestone} className={styles.milestoneForm}>
        <input
          type="text"
          placeholder="Task title"
          value={newMilestone.title}
          onChange={(e) =>
            setNewMilestone({ ...newMilestone, title: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Description"
          value={newMilestone.description}
          onChange={(e) =>
            setNewMilestone({ ...newMilestone, description: e.target.value })
          }
        />
        <input
          type="date"
          value={newMilestone.due_date}
          onChange={(e) =>
            setNewMilestone({ ...newMilestone, due_date: e.target.value })
          }
          required
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Visual Timeline */}
      <div className={styles.timelineWrapper}>
        <div className={styles.timeline}>
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className={styles.timelineItem}>
              {/* Timeline line */}
              {index < milestones.length - 1 && (
                <div className={styles.timelineLine} />
              )}

              {/* Timeline node */}
              <div
                className={`${styles.timelineNode} ${styles[milestone.status]}`}
                onClick={() => setSelectedMilestone(milestone)}
              >
                <div className={styles.nodeDot} />
                <div className={styles.nodeDate}>
                  {formatDate(milestone.due_date)}
                </div>
                <div className={styles.nodeTitle}>{milestone.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Milestone Details */}
      {selectedMilestone && (
        <div className={styles.milestoneDetails}>
          <div className={styles.detailsHeader}>
            <h2>{selectedMilestone.title}</h2>
            <button
              onClick={() => setSelectedMilestone(null)}
              className={styles.closeBtn}
            >
              ×
            </button>
          </div>

          <div className={styles.detailsContent}>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedMilestone.due_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong>
              <select
                value={selectedMilestone.status}
                onChange={(e) =>
                  updateStatus(selectedMilestone.id, e.target.value as any)
                }
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </p>

            <div className={styles.descriptionSection}>
              <strong>Description:</strong>
              <p>
                {selectedMilestone.description || "No description provided."}
              </p>
            </div>

            <button
              onClick={() => deleteMilestone(selectedMilestone.id)}
              className={styles.deleteBtn}
            >
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
