import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../../store/actions/auth";
import PasswordInput from "./PasswordInput";
import styles from "./styles.module.css";

const Login = ({ setError }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });

    const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const onLogin = async () => {
        const { email, password } = formData;
        if (!email || !password) return setError("All fields are required");
        if (!validateEmail(email)) return setError("Invalid email format");

        try {
            const result = await dispatch(handleLogin(email, password));
            if (!result.success) setError(result.error);
            else navigate("/");
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        }
    };

    return (
        <>
            <Typography variant="h6" align="left" sx={{ mb: 2 }}>
                Welcome
            </Typography>
            <Typography variant="body2" align="left" sx={{ mb: 2, color: "#666" }}>
                Sign in to your account
            </Typography>

            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                className={styles.input}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
            />
            <PasswordInput
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
            />

            <Button
                fullWidth
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => onLogin(formData)}
            >
                Login
            </Button>
        </>
    );
};

export default Login;
