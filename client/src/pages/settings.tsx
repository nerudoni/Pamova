import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        if (!res.data.loggedIn) {
          navigate("/login");
        }
      });
  }, []);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:3000/logout", {
        withCredentials: true,
      });
      console.log(response.data); // Use the response here
      navigate("/login");
    } catch (error) {
      console.error("error is: ", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      console.log(response.data); // Use the response here
    } catch (error) {
      console.error("error is: ", error);
    }
  };

  return (
    <>
      <h1>Hi settings</h1>
      <main>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Create an account</legend>
            <label htmlFor="username">
              <small>Username</small>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label htmlFor="password">
              <small>Password</small>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                autoComplete="off"
              />
            </label>
            <br />
            <button type="submit">Register</button>
          </fieldset>
        </form>
        <form onSubmit={handleLogout}>
          <button type="submit" id="log-out">
            Log out
          </button>
        </form>
      </main>
    </>
  );
}
export default settings;
