import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function resetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    try {
      await axios.post("http://localhost:3000/reset-password", {
        email,
        newPassword,
      });
      alert("Password updated successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error updating password");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
