import React, { useState } from "react";
import axios from "axios";
import "../styles/forgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = "http://127.0.0.1:8000/api";

  // ==============================
  // STEP 1 → Request OTP
  // ==============================
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_BASE}/password-reset/request/`, { email });
      setSuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STEP 2 → Verify OTP
  // ==============================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_BASE}/password-reset/verify/`, {
        email,
        otp,
      });

      setSuccess("OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError("Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STEP 3 → Reset Password
  // ==============================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/password-reset/confirm/`, {
        email,
        otp,
        new_password: newPassword,
      });

      setSuccess("Password reset successful. You can now login.");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2 className="title">Reset Your Password</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <label className="passnew">Email Address</label>
            <input
              className="newpass"
              type="email"
              required
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="reset" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <label className="passnew">Enter OTP</label>
            <input
              className="newpass"
              type="text"
              required
              maxLength="6"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="reset" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label>New Password</label>
            <input
              className="newpass"
              type="password"
              required
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label>Confirm Password</label>
            <input
              className="newpass"
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <button className="reset" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
