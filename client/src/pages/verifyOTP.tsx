import { useState, type CSSProperties } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VerifyOTP() {
  const styles: Record<string, CSSProperties> = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "80px",
    },
    input: {
      padding: "10px",
      margin: "10px",
      width: "250px",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    button: {
      padding: "10px 20px",
      marginTop: "10px",
      backgroundColor: "#008080",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    message: {
      marginTop: "20px",
      color: "#333",
    },
  };
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:3000/send-otp", {
        email,
      });
      setOtpSent(true);
      setMessage(response.data.message || "OTP sent successfully!");
    } catch (err: any) {
      setMessage("Error sending OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
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
      alert("Invalid OTP");
    }
  };

  return (
    <>
      <div style={styles.container}>
        <h2>Email OTP Verification</h2>

        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button onClick={sendOtp} style={styles.button}>
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input}
            />
            <button onClick={verifyOtp} style={styles.button}>
              Verify OTP
            </button>
          </>
        )}

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </>
  );
}

export default VerifyOTP;
