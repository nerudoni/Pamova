import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./verifyOTP.module.css";

function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:3000/send-otp", {
        email,
      });
      setOtpSent(true);
      setMessage(
        response.data.message || "Verification code sent to your email"
      );
    } catch (err: any) {
      setMessage(
        "Error sending verification code. Please check your email and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/verify-otp", {
        email,
        code: otp,
      });

      if (res.data.success) {
        navigate("/resetPassword", { state: { email } });
      }
    } catch (err) {
      console.error(err);
      setMessage("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.verifyCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Secure Verification</h1>
          <p className={styles.subtitle}>Reset your account password</p>
        </div>

        <div className={styles.steps}>
          <div className={`${styles.step} ${!otpSent ? styles.active : ""}`}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepLabel}>Enter Email</div>
          </div>
          <div className={`${styles.step} ${otpSent ? styles.active : ""}`}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepLabel}>Verify Code</div>
          </div>
        </div>

        {message && <div className={styles.message}>{message}</div>}

        <div className={styles.form}>
          {!otpSent ? (
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
              <button
                onClick={sendOtp}
                className={styles.button}
                disabled={isLoading || !email}
              >
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="otp" className={styles.label}>
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`${styles.input} ${styles.otpInput}`}
                maxLength={6}
                disabled={isLoading}
              />
              <button
                onClick={verifyOtp}
                className={styles.button}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          )}
        </div>

        <p className={styles.securityNote}>
          A verification code will be sent to your email address to ensure
          account security.
        </p>
      </div>
    </div>
  );
}

export default VerifyOTP;
