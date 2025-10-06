import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { PAGES } from "../constants/pages"
import { handleLogout } from "../store/actions/auth"

const NavigationBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    // Get user from localStorage (set by UserSelector) or sessionStorage
    useEffect(() => {
        const getUserData = () => {
            // First try sessionStorage (UserSelector)
            const sessionUser = sessionStorage.getItem('currentUser');
            if (sessionUser) {
                setCurrentUser(JSON.parse(sessionUser));
                return;
            }
            
            // Then try localStorage (auth bypass)
            const authState = localStorage.getItem('state');
            if (authState) {
                const userData = JSON.parse(authState);
                setCurrentUser({
                    username: userData.user?.username || 'User'
                });
            }
        };

        getUserData();
        
        // Listen for storage changes (when user switches)
        const handleStorageChange = () => getUserData();
        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically for sessionStorage changes
        const interval = setInterval(getUserData, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const onLogout = () => {
        dispatch(handleLogout());
        navigate(PAGES.LOGIN);
    };

    if (location.pathname === "/login" || location.pathname === "/register") {
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
                <img src="/logo.png" alt="Logo" style={{ height: 80 }} />
            </Box>

            <Box sx={{ display: "flex", gap: 4 }}>
                <a
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "#0091f3",
                    }}
                >
                    <Typography sx={{ fontSize: "1.2rem", fontWeight: "semibold" }}>Home</Typography>
                </a>

                <a
                    href="/questions"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "#0091f3",
                    }}
                >
                    <Typography sx={{ fontSize: "1.2rem", fontWeight: "semibold" }}>Question List</Typography>
                </a>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountCircleIcon sx={{ fontSize: 32, color: "#0091f3" }} />
                    <Typography sx={{ color: "#0091f3", fontWeight: "bold" }}>
                        {currentUser?.username || 'User'}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={onLogout}
                    sx={{
                        marginLeft: 4,
                        backgroundColor: "white",
                        color: "#0091f3",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#f1f1f1" },
                    }}
                >
                    <Typography sx={{ color: "#0091f3", fontWeight: "semibold" }}>Logout</Typography>
                </Button>
            </Box>
        </Box>
    );
};

export default NavigationBar;
