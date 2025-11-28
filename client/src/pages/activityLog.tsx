import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ActivityLog.module.css";

axios.defaults.withCredentials = true;

interface Activity {
  id: number;
  user_id: number;
  username: string;
  performer_username: string;
  action_type: string;
  resource_type: string;
  resource_id: number | null;
  description: string;
  old_values: string | null;
  new_values: string | null;
  ip_address: string;
  created_at: string;
}

interface FilterOptions {
  action_types: string[];
  resource_types: string[];
  users: { user_id: number; username: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Stats {
  recent_activity: number;
  activity_by_type: { action_type: string; count: number }[];
  most_active_users: { username: string; activity_count: number }[];
}

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    action_types: [],
    resource_types: [],
    users: [],
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    user_id: "",
    action_type: "",
    resource_type: "",
    start_date: "",
    end_date: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("activities");

  useEffect(() => {
    fetchActivities();
    fetchFilterOptions();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      // Add filters only if they have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await axios.get(
        `http://localhost:3000/activity-log?${params}`
      );
      console.log("Activities response:", response.data); // Debug log
      setActivities(response.data.activities);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching activities:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response:", error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/activity-log/filters"
      );
      console.log("Filter options:", response.data); // Debug log
      setFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/activity-log/stats?days=30"
      );
      console.log("Stats:", response.data); // Debug log
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      user_id: "",
      action_type: "",
      resource_type: "",
      start_date: "",
      end_date: "",
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
        return "📝";
      case "UPDATE":
        return "✏️";
      case "DELETE":
        return "🗑️";
      case "LOGIN":
        return "🔐";
      case "LOGOUT":
        return "🚪";
      case "SHARE":
        return "👥";
      default:
        return "📋";
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case "NOTE":
        return "📝";
      case "PROJECT":
        return "📁";
      case "MILESTONE":
        return "🎯";
      case "USER":
        return "👤";
      default:
        return "📄";
    }
  };

  const parseJsonValues = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Activity Log</h1>
        <p>Track all system activities and user actions</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "activities" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("activities")}
        >
          Activities
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "stats" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("stats")}
        >
          Statistics
        </button>
      </div>

      {activeTab === "activities" && (
        <>
          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>User</label>
                <select
                  value={filters.user_id}
                  onChange={(e) =>
                    handleFilterChange("user_id", e.target.value)
                  }
                >
                  <option value="">All Users</option>
                  {filterOptions.users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Action Type</label>
                <select
                  value={filters.action_type}
                  onChange={(e) =>
                    handleFilterChange("action_type", e.target.value)
                  }
                >
                  <option value="">All Actions</option>
                  {filterOptions.action_types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Resource Type</label>
                <select
                  value={filters.resource_type}
                  onChange={(e) =>
                    handleFilterChange("resource_type", e.target.value)
                  }
                >
                  <option value="">All Resources</option>
                  {filterOptions.resource_types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>From Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                />
              </div>

              <div className={styles.filterGroup}>
                <label>To Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                />
              </div>

              <button className={styles.clearFilters} onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className={styles.activitiesList}>
            {loading ? (
              <div className={styles.loading}>Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className={styles.noActivities}>
                No activities found matching your filters.
              </div>
            ) : (
              <>
                {activities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityHeader}>
                      <span className={styles.actionIcon}>
                        {getActionIcon(activity.action_type)}
                        {getResourceIcon(activity.resource_type)}
                      </span>
                      <div className={styles.activityInfo}>
                        <div className={styles.activityDescription}>
                          <strong>
                            {activity.performer_username || activity.username}
                          </strong>
                          <span className={styles.actionType}>
                            {activity.action_type}
                          </span>
                          {activity.resource_type.toLowerCase()}
                          {activity.resource_id && ` #${activity.resource_id}`}
                        </div>
                        <div className={styles.activityMeta}>
                          <span className={styles.timestamp}>
                            {formatDate(activity.created_at)}
                          </span>
                          {activity.ip_address && (
                            <span className={styles.ip}>
                              IP: {activity.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.activityDetails}>
                      <div className={styles.descriptionText}>
                        {activity.description}
                      </div>

                      {/* Show changes if available */}
                      {(activity.old_values || activity.new_values) && (
                        <div className={styles.changes}>
                          {parseJsonValues(activity.old_values) && (
                            <div className={styles.changeOld}>
                              <strong>Before:</strong>
                              {JSON.stringify(
                                parseJsonValues(activity.old_values)
                              )}
                            </div>
                          )}
                          {parseJsonValues(activity.new_values) && (
                            <div className={styles.changeNew}>
                              <strong>After:</strong>
                              {JSON.stringify(
                                parseJsonValues(activity.new_values)
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </button>

                    <span className={styles.pageInfo}>
                      Page {pagination.page} of {pagination.pages}
                    </span>

                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === "stats" && stats && (
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.recent_activity}</div>
              <div className={styles.statLabel}>Activities (30 days)</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {stats.most_active_users.length}
              </div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
          </div>

          <div className={styles.statsCharts}>
            <div className={styles.chartSection}>
              <h3>Activity by Type</h3>
              <div className={styles.chartBars}>
                {stats.activity_by_type.map((item) => (
                  <div key={item.action_type} className={styles.chartBar}>
                    <div className={styles.barLabel}>
                      <span>
                        {getActionIcon(item.action_type)} {item.action_type}
                      </span>
                      <span>{item.count}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${
                            (item.count / stats.recent_activity) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartSection}>
              <h3>Most Active Users</h3>
              <div className={styles.userList}>
                {stats.most_active_users.map((user, index) => (
                  <div key={user.username} className={styles.userItem}>
                    <span className={styles.userRank}>#{index + 1}</span>
                    <span className={styles.userName}>{user.username}</span>
                    <span className={styles.userCount}>
                      {user.activity_count} activities
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
