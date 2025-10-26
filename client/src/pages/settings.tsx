import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Settings() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState("employee");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("register"); // "register" or "profile"
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        if (!res.data.loggedIn) {
          navigate("/login");
        } else {
          setCurrentUser(res.data.user);
          // If user is logged in, fetch their profile data
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
        }
      });
  }, [navigate]);

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
      // Clear form
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setPhoneNumber("");
      setUserType("employee");
    } catch (error: any) {
      console.error("error is: ", error);
      alert(error.response?.data?.error || "Registration failed");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <>
      <h1>Settings</h1>
      <main>
        {/* Tab Navigation */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              marginRight: "10px",
              fontWeight: activeTab === "profile" ? "bold" : "normal",
            }}
          >
            My Profile
          </button>
          {currentUser?.type === "admin" && (
            <button
              onClick={() => setActiveTab("register")}
              style={{
                fontWeight: activeTab === "register" ? "bold" : "normal",
              }}
            >
              Register New User
            </button>
          )}
        </div>

        {/* Profile Update Form */}
        {activeTab === "profile" && currentUser && (
          <form onSubmit={handleProfileUpdate}>
            <fieldset>
              <legend>Update Profile</legend>

              <label htmlFor="email">
                <small>Email (cannot be changed)</small>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  disabled
                  style={{ backgroundColor: "#f0f0f0" }}
                />
              </label>

              <label htmlFor="firstName">
                <small>First Name *</small>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="lastName">
                <small>Last Name *</small>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="phoneNumber">
                <small>Phone Number (optional)</small>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>

              <label htmlFor="userType">
                <small>User Type</small>
                <select
                  id="userType"
                  value={userType}
                  disabled
                  style={{ backgroundColor: "#f0f0f0" }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </label>

              <br />
              <button type="submit">Update Profile</button>
            </fieldset>
          </form>
        )}

        {/* Registration Form (Admin only) */}
        {activeTab === "register" && currentUser?.type === "admin" && (
          <form onSubmit={handleRegister}>
            <fieldset>
              <legend>Register New User</legend>

              <label htmlFor="regEmail">
                <small>Email *</small>
                <input
                  id="regEmail"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="regFirstName">
                <small>First Name *</small>
                <input
                  id="regFirstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="regLastName">
                <small>Last Name *</small>
                <input
                  id="regLastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="regPassword">
                <small>Password *</small>
                <input
                  id="regPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="regPhoneNumber">
                <small>Phone Number (optional)</small>
                <input
                  id="regPhoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>

              <label htmlFor="regUserType">
                <small>User Type *</small>
                <select
                  id="regUserType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </label>

              <br />
              <button type="submit">Register User</button>
            </fieldset>
          </form>
        )}

        {/* Logout Button */}
        <form onSubmit={handleLogout} style={{ marginTop: "20px" }}>
          <button type="submit" id="log-out">
            Log out
          </button>
        </form>
      </main>
    </>
  );
}

export default Settings;
