import { Chip } from "@mui/material";

const difficultyColors = {
  Easy: "success",   
  Medium: "warning",
  Hard: "error",
};

export default function DifficultyChip({ difficulty }) {
    return (
        <Chip
        label={difficulty}
        color={difficultyColors[difficulty] || "default"}
        size="small"
        sx={{ fontWeight: "bold" }}
        />
    );
}
