import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    handleUpdateUsername,
    handleUpdatePassword,
    handleRequestEmailChange,
    handleVerifyEmailChange,
    handleDeleteUser,
} from "../../store/actions/user";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Stack,
    IconButton,
    Collapse,
} from "@mui/material";
import DeleteAccountModal from "./DeleteAccountModal";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import styles from "./styles.module.css";

const ProfileForm = () => {
    const dispatch = useDispatch();
    const currentEmail = useSelector((s) => s.auth.email);
    const currentUsername = useSelector((s) => s.auth.username);

    const [editMode, setEditMode] = useState(null);
    const [username, setUsername] = useState(currentUsername || "");
    const [pw, setPw] = useState({ current: "", next: "" });
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState({});
    const [success, setSuccess] = useState({});
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, []);

    const setFeedback = (type, key, message) => {
        setError(type === "error" ? { [key]: message } : {});
        setSuccess(type === "success" ? { [key]: message } : {});
    };

    const onUpdateUsername = async () => {
        if (!username.trim()) return setFeedback("error", "username", "Username cannot be empty");
        const res = await dispatch(handleUpdateUsername(username.trim()));
        if (res.success) {
            setFeedback("success", "username", res.message);
            setEditMode(null);
        } else setFeedback("error", "username", res.error);
    };

    const onChangePassword = async () => {
        if (!pw.current || !pw.next) return setFeedback("error", "password", "Both password fields are required");
        const res = await dispatch(handleUpdatePassword(pw.current, pw.next));
        if (res.success) {
            setPw({ current: "", next: "" });
            setFeedback("success", "password", res.message);
            setEditMode(null);
        } else setFeedback("error", "password", res.error);
    };

    const onSendOtp = async () => {
        if (!newEmail.trim()) return setFeedback("error", "email", "Enter a new email first");
        const res = await dispatch(handleRequestEmailChange(newEmail.trim()));
        if (res.success) {
            setFeedback("success", "email", res.message || "OTP sent!");
            setCooldown(30);
        } else setFeedback("error", "email", res.error);
    };

    const onVerifyOtp = async () => {
        if (!newEmail.trim() || !otp.trim()) return setFeedback("error", "email", "Email and OTP required");
        const res = await dispatch(handleVerifyEmailChange(newEmail.trim(), otp.trim()));
        if (res.success) {
            setFeedback("success", "email", res.message);
            setEditMode(null);
            setNewEmail("");
            setOtp("");
        } else setFeedback("error", "email", res.error);
    };

    const onDeleteConfirmed = async () => {
        const res = await dispatch(handleDeleteUser());
        if (res.success) {
            window.location.href = "/login";
        }
    };

    return (
        <div className={styles.container}>
            <Typography variant="h5" className={styles.header}>
                Profile Settings
            </Typography>

            <Card className={styles.topCard}>
                <CardContent>
                    <Box className={styles.infoRow}>
                        <Box
                            className={`${styles.infoItem} ${editMode === "username" ? styles.activeEdit : ""}`}
                        >
                            <Box className={styles.infoHeader}>
                                <Typography variant="subtitle1">Username</Typography>
                                <IconButton size="small" onClick={() => setEditMode(editMode === "username" ? null : "username")}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography>{currentUsername}</Typography>

                            <Collapse in={editMode === "username"}>
                                <Box className={styles.editBox}>
                                    <TextField
                                        label="New Username"
                                        fullWidth
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        error={!!error.username}
                                        helperText={error.username}
                                    />
                                    {success.username && (
                                        <Typography className={styles.successText}>
                                            <CheckCircleIcon fontSize="small" /> {success.username}
                                        </Typography>
                                    )}
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Button variant="contained" onClick={onUpdateUsername}>Save</Button>
                                        <Button variant="outlined" onClick={() => setEditMode(null)}>Cancel</Button>
                                    </Stack>
                                </Box>
                            </Collapse>
                        </Box>

                        <Box
                            className={`${styles.infoItem} ${editMode === "email" ? styles.activeEdit : ""}`}
                        >
                            <Box className={styles.infoHeader}>
                                <Typography variant="subtitle1">Email</Typography>
                                <IconButton size="small" onClick={() => setEditMode(editMode === "email" ? null : "email")}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography>{currentEmail}</Typography>

                            <Collapse in={editMode === "email"}>
                                <Box className={styles.editBox}>
                                    <TextField
                                        label="New Email"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        error={!!error.email}
                                        helperText={error.email}
                                    />
                                    <Button
                                        variant="outlined"
                                        sx={{ mt: 2 }}
                                        onClick={onSendOtp}
                                        disabled={cooldown > 0}
                                    >
                                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
                                    </Button>
                                    <TextField
                                        label="Enter OTP"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    {success.email && (
                                        <Typography className={styles.successText}>
                                            <CheckCircleIcon fontSize="small" /> {success.email}
                                        </Typography>
                                    )}
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Button variant="contained" onClick={onVerifyOtp}>Verify & Update</Button>
                                        <Button variant="outlined" onClick={() => setEditMode(null)}>Cancel</Button>
                                    </Stack>
                                </Box>
                            </Collapse>
                        </Box>

                        <Box
                            className={`${styles.infoItem} ${editMode === "password" ? styles.activeEdit : ""}`}
                        >
                            <Box className={styles.infoHeader}>
                                <Typography variant="subtitle1">Password</Typography>
                                <IconButton size="small" onClick={() => setEditMode(editMode === "password" ? null : "password")}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography>********</Typography>

                            <Collapse in={editMode === "password"}>
                                <Box className={styles.editBox}>
                                    <TextField
                                        label="Current Password"
                                        type="password"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        value={pw.current}
                                        onChange={(e) => setPw({ ...pw, current: e.target.value })}
                                    />
                                    <TextField
                                        label="New Password"
                                        type="password"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        value={pw.next}
                                        onChange={(e) => setPw({ ...pw, next: e.target.value })}
                                        error={!!error.password}
                                        helperText={error.password}
                                    />
                                    {success.password && (
                                        <Typography className={styles.successText}>
                                            <CheckCircleIcon fontSize="small" /> {success.password}
                                        </Typography>
                                    )}
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Button variant="contained" onClick={onChangePassword}>Update Password</Button>
                                        <Button variant="outlined" onClick={() => setEditMode(null)}>Cancel</Button>
                                    </Stack>
                                </Box>
                            </Collapse>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box>
                <Button color="error" variant="outlined" onClick={() => { setDeleteOpen(true) }}>
                    Delete Account
                </Button>
            </Box>


            <DeleteAccountModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={onDeleteConfirmed}
                username={currentUsername}
            />
        </div>
    );
};

export default ProfileForm;
