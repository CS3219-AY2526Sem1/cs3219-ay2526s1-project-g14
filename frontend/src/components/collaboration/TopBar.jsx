import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Button, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
    ExitToApp as ExitIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import TopBarTimer from "./TopBarTimer";
import { getUserById } from "../../controller/userController"

export default function TopBar({ partner, startTime, connectedUsers, handleEndSession }) {
    const username = useSelector((state) => state.auth.username);
    const [partnerUsername, setPartnerUsername] = useState(null)

    useEffect(() => {
        const fetchPartnerUsername = async () => {
            try {
                if (!partner) return;
                const result = await getUserById(partner);
                setPartnerUsername(result.username);
            } catch (err) {
                console.error("Error retrieving partner username", err);
            }
        };
        fetchPartnerUsername();
    }, [partner]);
    
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 3,
                borderBottom: "1px solid #eee",
                bgcolor: "white"
            }}
        >
        <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                PeerPrep Session
            </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2"><TopBarTimer startTime={startTime} /></Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
                <Chip 
                    icon={<PersonIcon />} 
                    label={`${connectedUsers} connected`} 
                    sx={{ bgcolor: "#EDF2FF", color: "#000", fontWeight: "bold" }}
                />
                <Chip 
                    sx={{ bgcolor: "#EDF2FF", color: "#000", fontWeight: "bold" }} 
                    label={`${username} and ${partnerUsername}`} 
                />
            </Box>
            <Button 
                startIcon={<ExitIcon />} 
                variant="contained" 
                sx={{
                    bgcolor: "#EDF2FF",  
                    color: "#000",          
                    "&:hover": {
                    bgcolor: "#D6E0FF", 
                    },
                }}
                onClick={handleEndSession}
            >
                End Session
            </Button>
        </Box>
        </Box>
    );
}
