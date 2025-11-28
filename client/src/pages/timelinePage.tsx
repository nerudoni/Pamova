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
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      axios
        .delete(`http://localhost:3000/milestones/${milestoneId}`)
        .then(() => {
          fetchMilestones();
          if (selectedMilestone?.id === milestoneId) {
            setSelectedMilestone(null);
          }
        })
        .catch(console.error);
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
      <div className={styles.header}>
        <h1 className={styles.title}>Project Timeline</h1>
        <p className={styles.subtitle}>Track and manage project milestones</p>
      </div>

      {/* Add Milestone Form */}
      <form onSubmit={addMilestone} className={styles.milestoneForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Task Title</label>
          <input
            type="text"
            placeholder="Enter task title"
            value={newMilestone.title}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, title: e.target.value })
            }
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Due Date</label>
          <input
            type="date"
            value={newMilestone.due_date}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, due_date: e.target.value })
            }
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            placeholder="Enter task description"
            value={newMilestone.description}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, description: e.target.value })
            }
          />
        </div>

        <button type="submit" className={styles.addButton}>
          Add Task
        </button>
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
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Due Date:</span>
              <span>
                {new Date(selectedMilestone.due_date).toLocaleDateString()}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status:</span>
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
            </div>

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
