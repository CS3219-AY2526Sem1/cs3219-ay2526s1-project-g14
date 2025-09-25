import { Chip, Paper, Typography, CircularProgress, Box, Stack } from "@mui/material";
import DifficultyChip from "../DifficultyChip"

export default function RecentQuestions({ recentQuestions, loading }) {
    return (
        <Paper sx={{ flex: 1, p: 3, minWidth: 280, border: "1px solid #0091f3", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0091f3", mb: 2 }}>
            Recent Questions Solved
        </Typography>

        {loading ? (
            <CircularProgress sx={{ color: "#0091f3" }} />
        ) : recentQuestions.length === 0 ? (
            <Typography>No recent questions.</Typography>
        ) : (
            <Stack spacing={1}>
            {recentQuestions.map((q) => (
                <Box key={q._id} sx={{ p: 1, border: "1px solid #0091f3", borderRadius: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>{q.title}</Typography>
                <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                    <DifficultyChip difficulty={q.difficulty} />
                    {q.topic.map((t) => (
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
                </Box>
            ))}
            </Stack>
        )}
        </Paper>
    );
}
