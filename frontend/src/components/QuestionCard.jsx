import { Box, Chip, Typography } from "@mui/material";
import DifficultyChip from "./DifficultyChip";

export default function QuestionCard({ question }) {
    return (
        <Box
            p={2}
            borderRadius={2}
            sx={{
                border: "1px solid #0091f3",
                "&:hover": { boxShadow: "0 2px 8px rgba(54, 55, 56, 0.2)" },
            }}
        >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0091f3" }}>
            {question.title}
        </Typography>
        <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
            <DifficultyChip difficulty={question.difficulty} />
            {question.topic.map((t) => (
                <Chip
                    key={t}
                    label={t}
                    size="small"
                    sx={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    color: "#0091f3",
                    }}
                />
            ))}
        </Box>
        <Typography sx={{ mt: 1 }}>{question.description}</Typography>
        </Box>
    );
}
