import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import styles from "./styles.module.css";

const OTPModal = ({ email, onVerified, onResend, otpError, otpInfo, setOtpError, setOtpInfo }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, "");
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val && idx < 5) {
      inputsRef.current[idx + 1].focus();
    }

    if (newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleVerify = async (otpCode) => {
    setOtpError("");
    setOtpInfo("");
    const code = otpCode || otp.join("");
    if (code.length < 6) {
      setOtpError("Complete OTP required");
      return;
    }
    try {
      await onVerified(code);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setOtpError(err.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    setOtpError("");
    setOtpInfo("");
    try {
      await onResend(email);
      setResendTimer(60);
    } catch (err) {
      setOtpError(err.message || "Failed to send OTP");
    }
  };

  return (
    <div className={styles.otpOverlay}>
      <Box className={styles.otpModal}>
        <Typography className={styles.otpHeading}>Enter OTP</Typography>
        <Typography className={styles.otpInfo}>OTP sent to <strong>{email}</strong></Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => (inputsRef.current[idx] = el)}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                width: "50px",
                height: "60px",
                textAlign: "center",
                fontSize: "20px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </Box>

        <div className={styles.otpButtons} style={{ marginTop: "24px" }}>
          <Button className={styles.otpPrimaryButton} onClick={() => handleVerify()}>
            Verify
          </Button>
          <Button
            className={styles.otpSecondaryButton}
            onClick={handleResend}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend"}
          </Button>
        </div>

        <div className={styles.otpMessage} style={{ marginTop: "16px" }}>
          {otpError && <Typography className={styles.otpError}>{otpError}</Typography>}
          {otpInfo && <Typography className={styles.otpInfoMessage}>{otpInfo}</Typography>}
        </div>
      </Box>
    </div>
  );
};

export default OTPModal;
