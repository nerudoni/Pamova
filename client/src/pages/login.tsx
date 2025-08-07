import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(username, password);
    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Log in failed: ", error);
    }
  };
  return (
    <>
      <h1>Hi Login</h1>
      <main>
        <form onSubmit={handleLogin}>
          <fieldset>
            <legend>Login to your account</legend>
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
            <button type="submit">Log in</button>
          </fieldset>
        </form>
      </main>
    </>
  );
}
export default Login;
