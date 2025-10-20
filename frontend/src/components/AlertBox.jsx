import { useEffect } from "react";
import { Box } from "@mui/material";

export default function AlertBox({ message, setMessage }) {
    useEffect(() => {
        if (message) {
        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    if (!message) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                minWidth: 300,
                maxWidth: "80%",
                textAlign: "center",
                p: 1.5,
                borderRadius: 1,
                bgcolor: message.type === "error" ? "#fdecea" : "#edf7ed",
                color: message.type === "error" ? "#d32f2f" : "#2e7d32",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontWeight: 500,
            }}
        >
        {message.text}
        </Box>
    );
}
