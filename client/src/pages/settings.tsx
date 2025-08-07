import { useState } from "react";
import axios from "axios";

function settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      </main>
    </>
  );
}
export default settings;
