import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./dashboard.module.css"; // Import the CSS module

interface User {
  userid: number;
  email: string;
  displayName: string;
  type: string;
}

interface Project {
  projectID: number;
  project_name: string;
  status: string;
  client: string;
  country: string;
  start_date: string;
}

interface Milestone {
  id: number;
  project_id: number;
  title: string;
  due_date: string;
  status: string;
  project_name?: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  priority: string;
  is_done: boolean;
  created_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<Milestone[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        if (!res.data.loggedIn) {
          navigate("/login");
        } else {
          setUser(res.data.user);
          loadDashboardData();
        }
      })
      .catch((err) => {
        console.error("Error checking login:", err);
        navigate("/login");
      });
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load ongoing projects
      const projectsResponse = await axios.get(
        "http://localhost:3000/projects",
        {
          withCredentials: true,
        }
      );
      const allProjects = projectsResponse.data;
      const ongoing = allProjects
        .filter((project: Project) => project.status === "ongoing")
        .slice(0, 5);
      setOngoingProjects(ongoing);

      // Load upcoming milestones (next 30 days)
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      const nextMonthStr = nextMonth.toISOString().split("T")[0];

      const milestonesPromises = allProjects.map((project: Project) =>
        axios.get(
          `http://localhost:3000/projects/${project.projectID}/milestones`,
          {
            withCredentials: true,
          }
        )
      );

      const milestonesResponses = await Promise.all(milestonesPromises);
      const allMilestones: Milestone[] = [];

      milestonesResponses.forEach((response, index) => {
        const projectMilestones = response.data.map((milestone: Milestone) => ({
          ...milestone,
          project_name: allProjects[index].project_name,
        }));
        allMilestones.push(...projectMilestones);
      });

      const upcoming = allMilestones
        .filter(
          (milestone: Milestone) =>
            milestone.due_date >= today &&
            milestone.due_date <= nextMonthStr &&
            milestone.status !== "completed"
        )
        .sort((a: Milestone, b: Milestone) =>
          a.due_date.localeCompare(b.due_date)
        )
        .slice(0, 5);

      setUpcomingMilestones(upcoming);

      // Load recent notes
      const notesResponse = await axios.get("http://localhost:3000/notes", {
        withCredentials: true,
      });
      const recent = notesResponse.data.slice(0, 3);
      setRecentNotes(recent);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntil = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityClass = (priority: string) => {
    return styles[`priority-${priority.toLowerCase()}`];
  };

  const getStatusClass = (isDone: boolean) => {
    return styles[`status-${isDone ? "done" : "pending"}`];
  };

  const getDeadlineClass = (daysUntil: number) => {
    return styles[`deadline-${daysUntil <= 7 ? "urgent" : "normal"}`];
  };

  if (loading) {
    return <div className={styles.dashboardLoading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <h1>
          {user?.type === "admin" || user?.type === "owner"
            ? `Welcome, ${user.displayName}`
            : `Hello, ${user?.displayName}`}
        </h1>
        {(user?.type === "admin" || user?.type === "owner") && (
          <Link to="/activity-log" className={styles.adminLink}>
            View Activity Log
          </Link>
        )}
      </header>

      <div className={styles.dashboardGrid}>
        {/* Ongoing Projects Section */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Ongoing Projects</h2>
            <Link to="/projects" className={styles.viewAllLink}>
              View All
            </Link>
          </div>
          {ongoingProjects.length > 0 ? (
            <div className={styles.projectsList}>
              {ongoingProjects.map((project) => (
                <div key={project.projectID} className={styles.projectCard}>
                  <h3>{project.project_name}</h3>
                  <p>
                    <strong>Client:</strong> {project.client}
                  </p>
                  <p>
                    <strong>Country:</strong> {project.country}
                  </p>
                  <p>
                    <strong>Started:</strong> {formatDate(project.start_date)}
                  </p>
                  <Link
                    to={`/projects/${project.projectID}`}
                    className={styles.projectLink}
                  >
                    View Project
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No ongoing projects</p>
          )}
        </section>

        {/* Upcoming Deadlines Section */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Deadlines</h2>
            <Link to="/timeline" className={styles.viewAllLink}>
              View Timeline
            </Link>
          </div>
          {upcomingMilestones.length > 0 ? (
            <div className={styles.milestonesList}>
              {upcomingMilestones.map((milestone) => {
                const daysUntil = getDaysUntil(milestone.due_date);
                return (
                  <div key={milestone.id} className={styles.milestoneCard}>
                    <h3>{milestone.title}</h3>
                    <p>
                      <strong>Project:</strong> {milestone.project_name}
                    </p>
                    <p>
                      <strong>Due:</strong> {formatDate(milestone.due_date)}
                    </p>
                    <p className={getDeadlineClass(daysUntil)}>
                      {daysUntil === 0
                        ? "Due today"
                        : daysUntil === 1
                        ? "Due tomorrow"
                        : `${daysUntil} days left`}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.noData}>No upcoming deadlines</p>
          )}
        </section>

        {/* Notes Section */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Recent Notes</h2>
            <Link to="/notes" className={styles.viewAllLink}>
              View All Notes
            </Link>
          </div>
          {recentNotes.length > 0 ? (
            <div className={styles.notesList}>
              {recentNotes.map((note) => (
                <div key={note.id} className={styles.noteCard}>
                  <h3>{note.title}</h3>
                  <p className={styles.notePreview}>
                    {note.content.length > 100
                      ? `${note.content.substring(0, 100)}...`
                      : note.content}
                  </p>
                  <div className={styles.noteMeta}>
                    <span className={getPriorityClass(note.priority)}>
                      {note.priority}
                    </span>
                    <span className={getStatusClass(note.is_done)}>
                      {note.is_done ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No notes yet</p>
          )}
        </section>

        {/* Quick Actions Section */}
        <section
          className={`${styles.dashboardSection} ${styles.quickActions}`}
        >
          <h2>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link to="/createProject" className={styles.actionCard}>
              <h3>Create New Project</h3>
              <p>Start a new construction project</p>
            </Link>
            <Link to="/notes" className={styles.actionCard}>
              <h3>Add Note</h3>
              <p>Create a new note or reminder</p>
            </Link>
            <Link to="/manage" className={styles.actionCard}>
              <h3>Manage Projects</h3>
              <p>Edit existing projects</p>
            </Link>
            {(user?.type === "admin" || user?.type === "owner") && (
              <Link to="/admin/users" className={styles.actionCard}>
                <h3>User Management</h3>
                <p>Manage team members</p>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
