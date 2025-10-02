import { useState } from "react";
import { useDispatch } from "react-redux";
import { handleRegister } from "../../store/actions/auth";
import styles from "./styles.module.css";
import { TextField, Button, Typography } from "@mui/material";
import PasswordInput from "./PasswordInput";

const Register = ({ setError }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });


    const validatePassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(password);

    const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const onSignUp = () => {
        const { username, email, password } = formData;
        if (!username || !email || !password) return setError("All fields are required");
        if (!validateEmail(email)) return setError("Invalid email format");
        if (!validatePassword(password))
            return setError("Password must be 8+ chars, include uppercase, lowercase & special character");

        dispatch(handleRegister(username, email, password))
            .then((result) => {
                if (!result.success) setError(result.error);
            })
            .catch((err) => {
                console.error(err);
                setError("Something went wrong");
            });
    };

    return (
        <>
            <Typography variant="body2" align="left" sx={{ mb: 2, color: "#666" }}>
                Create a new account
            </Typography>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                className={styles.input}
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
            />
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
                onClick={() => onSignUp(formData)}
            >
                Register
            </Button>
        </>
    );
};

export default Register;
