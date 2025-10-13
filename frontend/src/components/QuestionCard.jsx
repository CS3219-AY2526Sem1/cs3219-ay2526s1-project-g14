import { Box, Chip, Typography } from "@mui/material";
import DifficultyChip from "./DifficultyChip";

export default function QuestionCard({ question }) {
    return (
        <Box
            p={2}
            borderRadius={2}
            sx={{
                backgroundColor: "white",
                border: "1px solid black",
                "&:hover": { boxShadow: "0 2px 8px rgba(54, 55, 56, 0.2)" },
            }}
        >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
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
                    backgroundColor: "#EDF2FF",
                    color: "black",
                    border: "1px solid gray"
                    }}
                />
            ))}
        </Box>
        <Typography sx={{ mt: 1 }}>{question.description}</Typography>
        </Box>
    );
}
