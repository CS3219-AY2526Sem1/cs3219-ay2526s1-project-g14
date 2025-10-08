import { Box, Typography } from "@mui/material";

export default function DescriptionSection({ description }) {
    return (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: "#555" }}>
                {description || "No description available."}
            </Typography>
        </Box>
    );
}
