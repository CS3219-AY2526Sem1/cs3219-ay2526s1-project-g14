import { useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import Filters from "../Filters";
import { fetchOneQuestion } from "../../controller/questionsController";
import QuestionCard from "../QuestionCard"

export default function MatchingBox({
    topics,
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
}) {
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleStartMatching = async () => {
        setLoading(true);
        try {
            const question = await fetchOneQuestion(selectedTopic, selectedDifficulty)
            setQuestion(question);
        } catch (err) {
            console.error(err);
            setQuestion(null);
        } finally {
            setLoading(false);
        }
    };

  return (
        <Paper sx={{ flex: 1, p: 3, minWidth: 280, border: "1px solid #0091f3", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0091f3", mb: 2 }}>
            Start Matching
        </Typography>

        <Filters
            topics={topics}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
        />

        <Button
            variant="contained"
            sx={{
            backgroundColor: "#0091f3",
            color: "white",
            textTransform: "none",
            mt: 1,
            transition: "0.3s",
            "&:hover": { backgroundColor: "#0077c2", transform: "scale(1.05)" },
            }}
            onClick={handleStartMatching}
        >
            Start Matching
        </Button>

        {loading && <Typography mt={2}>Loading...</Typography>}

        {question && !loading && (
            <Box paddingTop={2}>
                <QuestionCard question={question} />
            </Box>
        )}
        </Paper>
    );
}