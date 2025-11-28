import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:3000/reset-password", {
        email,
        newPassword,
      });
      alert("Password updated successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error updating password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.resetCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Create your new secure password</p>
        </div>

        {email && <div className={styles.userEmail}>Account: {email}</div>}

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />

            <div className={styles.passwordRequirements}>
              <div className={styles.requirementsTitle}>
                Password Requirements
              </div>
              <ul className={styles.requirementsList}>
                <li className={styles.requirement}>Minimum 6 characters</li>
                <li className={styles.requirement}>
                  Use a combination of letters and numbers
                </li>
                <li className={styles.requirement}>
                  Avoid common words and patterns
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleReset}
            className={styles.button}
            disabled={isLoading || !newPassword}
          >
            {isLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Updating Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>

        <p className={styles.securityNote}>
          Your password will be securely updated. You will be redirected to
          login after successful reset.
        </p>
      </div>
    </div>
  );
}
