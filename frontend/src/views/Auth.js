import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import OTPModal from "../components/auth/OTPModal";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import GoogleAuth from "../components/auth/GoogleAuth";
import styles from "../components/auth/styles.module.css";
import { handleVerifyOTP, handleResendOTP } from "../store/actions/auth";

const AuthCard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const TABS = ["Login", "Sign Up"];
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [error, setError] = useState("");
    const { otpEmail } = useSelector((state) => state.auth);
    const [otpError, setOtpError] = useState("");
    const [otpInfo, setOtpInfo] = useState("");

    return (
        <Box className={styles.pageWrapper}>

            {otpEmail && (
                <OTPModal
                    email={otpEmail}
                    onClose={false}
                    otpError={otpError}
                    otpInfo={otpInfo}
                    setOtpError={setOtpError}
                    setOtpInfo={setOtpInfo}
                    onVerified={async (otp) => {
                        const result = await dispatch(handleVerifyOTP(otpEmail, otp));
                        if (!result.success) {
                            setOtpError(result.error);
                        } else {
                            navigate("/");
                        }
                    }}
                    onResend={async (email) => {
                        const result = await dispatch(handleResendOTP(email));
                        if (!result.success) {
                            setOtpError(result.error);
                        } else {
                            setOtpInfo("OTP sent to your email");
                        }
                    }}
                />
            )}

            <Box className={styles.container}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    PeerPrep
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: "#555" }}>
                    Technical Interview Preparation Platform
                </Typography>

                <Box className={styles.inputContainer}>
                    <Box className={styles.tabContainer}>
                        {TABS.map((tab) => (
                            <div
                                key={tab}
                                className={styles.tabButton}
                                onClick={() => setActiveTab(tab)}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="pill"
                                        className={styles.pill}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className={activeTab === tab ? styles.activeText : styles.inactiveText}>
                                    {tab}
                                </span>
                            </div>
                        ))}
                    </Box>

                    <AnimatePresence mode="wait">
                        {activeTab === "Login" ? (
                            <motion.div
                                key="login"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Login setError={setError} />
                                <div className={styles.errorWrapper}>
                                    {error && <Typography className={styles.error}>{error}</Typography>}
                                </div>
                                <GoogleAuth setError={setError} mode="login" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signup"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Register setError={setError} />
                                <div className={styles.errorWrapper}>
                                    {error && <Typography className={styles.error}>{error}</Typography>}
                                </div>
                                <GoogleAuth setError={setError} mode="signup" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </Box>
            </Box>
        </Box>
    );
};

export default AuthCard;
