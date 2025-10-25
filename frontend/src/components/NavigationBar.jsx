import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PAGES } from "../constants/pages"
import { handleLogout } from "../store/actions/auth"

const NavigationBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const username = useSelector((state) => state.auth.username);
    const role = useSelector((state) => state.auth.role);

    const onLogout = () => {
        dispatch(handleLogout());
        navigate(PAGES.LOGIN);
    };

    const isCollaborationPage = /^\/collaboration(\/|$)/.test(location.pathname);


    if (location.pathname === "/login" || location.pathname === "/register" || isCollaborationPage) {
        return null;
    }

    return (
        <Box
            component="nav"
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 4,
                py: 2,
                color: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <img src="/logo.png" alt="Logo" style={{ height: 80 }} /> */}
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "black" }}>PeerPrep</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 4 }}>
                <a
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "black",
                    }}
                >
                    <Typography sx={{ fontSize: "1rem", fontWeight: "semibold" }}>Home</Typography>
                </a>
                <a
                    href="/questions"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "black",
                    }}
                >
                    <Typography sx={{ fontSize: "1rem", fontWeight: "semibold" }}>Question List</Typography>
                </a>
                {role === "admin" && (
                    <a
                    href="/add-question"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "black",
                    }}
                    >
                    <Typography sx={{ fontSize: "1rem", fontWeight: "semibold" }}>Add Question</Typography>
                    </a>
                )}
                <a
                    href="/leaderboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "black",
                    }}
                >
                    <Typography sx={{ fontSize: "1rem", fontWeight: "semibold" }}>Leaderboard</Typography>
                </a>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountCircleIcon sx={{ fontSize: 32, color: "black" }} />
                    <a href="/profile">
                        <Typography sx={{ color: "black", fontWeight: "bold" }}>
                            {username || 'User'}
                        </Typography>
                    </a>
                </Box>
                {role === "admin" && (
                    <Chip 
                        label="Admin"
                        sx={{ bgcolor: "#EDF2FF", color: "#000", border: "0.5px solid #000", fontWeight: "semibold"}}
                    />
                )}
                <Button
                    variant="outlined"
                    onClick={onLogout}
                    sx={{
                        marginLeft: 4,
                        backgroundColor: "white",
                        color: "#EDF2FF",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#f1f1f1" },
                    }}
                >
                    <Typography sx={{ color: "black", fontWeight: "semibold" }}>Logout</Typography>
                </Button>
            </Box>
        </Box>
    );
};

export default NavigationBar;
