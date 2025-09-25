import { useNavigate } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const NavigationBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // clear JWT, reset user state
        navigate("/login"); 
    };
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
        <Box sx={{ display: "flex", alignItems: "center"}}>
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
                <Typography sx={{ color: "#0091f3", fontWeight: "bold" }}>Rachel</Typography>
            </Box>
            <Button
                variant="outlined"
                onClick={handleLogout}
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
