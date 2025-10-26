import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./settings.module.css";

function Settings() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState("employee");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isAdminOrOwner =
    currentUser?.type === "admin" || currentUser?.type === "owner";

  useEffect(() => {
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        if (!res.data.loggedIn) {
          navigate("/login");
        } else {
          setCurrentUser(res.data.user);
          axios
            .get("http://localhost:3000/user/profile", {
              withCredentials: true,
            })
            .then((profileRes) => {
              const userData = profileRes.data;
              setFirstName(userData.first_name);
              setLastName(userData.last_name);
              setEmail(userData.email);
              setPhoneNumber(userData.phone_number || "");
              setUserType(userData.type);
            })
            .catch(console.error);

          if (isAdminOrOwner) {
            loadAllUsers();
          }
        }
      });
  }, [navigate, isAdminOrOwner]);

  const loadAllUsers = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:3000/admin/users", { withCredentials: true })
      .then((res) => setAllUsers(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:3000/logout", {
        withCredentials: true,
      });
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("error is: ", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        {
          email,
          first_name: firstName,
          last_name: lastName,
          password,
          type: userType,
          phone_number: phoneNumber,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      alert("Registration successful!");
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setPhoneNumber("");
      setUserType("employee");
      loadAllUsers();
      setActiveTab("manage");
    } catch (error: any) {
      console.error("error is: ", error);
      alert(error.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        "http://localhost:3000/user/profile",
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("error is: ", error);
      alert(error.response?.data?.error || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setPhoneNumber(user.phone_number || "");
    setUserType(user.type);
    setActiveTab("edit");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:3000/admin/users/${editingUser.id}`,
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          type: userType,
          phone_number: phoneNumber,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      alert("User updated successfully!");
      setEditingUser(null);
      loadAllUsers();
      setActiveTab("manage");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setUserType("employee");
    } catch (error: any) {
      console.error("error is: ", error);
      alert(error.response?.data?.error || "User update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:3000/admin/users/${userId}`,
        { withCredentials: true }
      );
      console.log(response.data);
      alert("User deleted successfully!");
      loadAllUsers();
    } catch (error: any) {
      console.error("error is: ", error);
      alert(error.response?.data?.error || "User deletion failed");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setActiveTab("manage");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setUserType("employee");
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>Settings</h1>
        <p className={styles.settingsSubtitle}>Manage your account and users</p>
      </div>

      <div className={styles.settingsContent}>
        {/* Tab Navigation */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "profile" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <span className={styles.tabIcon}>👤</span>
              My Profile
            </button>
            {isAdminOrOwner && (
              <>
                <button
                  className={`${styles.tab} ${
                    activeTab === "register" ? styles.tabActive : ""
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  <span className={styles.tabIcon}>➕</span>
                  Register User
                </button>
                <button
                  className={`${styles.tab} ${
                    activeTab === "manage" ? styles.tabActive : ""
                  }`}
                  onClick={() => setActiveTab("manage")}
                >
                  <span className={styles.tabIcon}>👥</span>
                  Manage Users
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        )}

        {/* Profile Update Form */}
        {activeTab === "profile" && currentUser && !isLoading && (
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Profile Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      className={styles.formInputDisabled}
                      type="email"
                      value={email}
                      disabled
                    />
                    <small className={styles.formHelp}>
                      Email cannot be changed
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>First Name *</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Last Name *</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input
                      className={styles.formInput}
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>User Type</label>
                    <select
                      className={styles.formSelectDisabled}
                      value={userType}
                      disabled
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {activeTab === "register" && isAdminOrOwner && !isLoading && (
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Register New User</h2>
              <form onSubmit={handleRegister}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <input
                      className={styles.formInput}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>First Name *</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Last Name *</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password *</label>
                    <input
                      className={styles.formInput}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input
                      className={styles.formInput}
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>User Type *</label>
                    <select
                      className={styles.formSelect}
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      required
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === "manage" && isAdminOrOwner && !isLoading && (
          <div className={styles.managementContainer}>
            <div className={styles.managementHeader}>
              <h2 className={styles.managementTitle}>User Management</h2>
              <p className={styles.managementSubtitle}>
                Manage all system users
              </p>
            </div>

            {allUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>No Users Found</h3>
                <p>Get started by registering a new user.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={
                          user.id === currentUser.userid
                            ? styles.currentUser
                            : ""
                        }
                      >
                        <td>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {user.first_name} {user.last_name}
                            </span>
                            {user.id === currentUser.userid && (
                              <span className={styles.userBadge}>You</span>
                            )}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`${styles.userType} ${
                              styles[
                                `userType${
                                  user.type.charAt(0).toUpperCase() +
                                  user.type.slice(1)
                                }`
                              ]
                            }`}
                          >
                            {user.type}
                          </span>
                        </td>
                        <td>{user.phone_number || "-"}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.btnOutline}
                              onClick={() => handleEditUser(user)}
                              disabled={user.id === currentUser.userid}
                            >
                              Edit
                            </button>
                            <button
                              className={styles.btnDanger}
                              onClick={() =>
                                handleDeleteUser(
                                  user.id,
                                  `${user.first_name} ${user.last_name}`
                                )
                              }
                              disabled={user.id === currentUser.userid}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit User Form */}
        {activeTab === "edit" && editingUser && !isLoading && (
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>
                  Edit User: {editingUser.first_name} {editingUser.last_name}
                </h2>
                <button className={styles.btnText} onClick={cancelEdit}>
                  ← Back to Management
                </button>
              </div>

              <form onSubmit={handleUpdateUser}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <input
                      className={styles.formInput}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>First Name *</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Last Name *</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input
                      className={styles.formInput}
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>User Type *</label>
                    <select
                      className={styles.formSelect}
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      required
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update User"}
                  </button>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className={styles.logoutSection}>
          <form onSubmit={handleLogout}>
            <button type="submit" className={styles.btnLogout}>
              🚪 Log Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
