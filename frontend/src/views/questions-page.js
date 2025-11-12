import { useEffect, useState } from "react";
import { fetchQuestions, fetchTopics } from "../controller/questionsController";
import { Box, Typography, CircularProgress } from "@mui/material";
import QuestionCard from "../components/QuestionCard";
import Filters from "../components/Filters";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch topics once
  useEffect(() => {
    const getTopics = async () => {
      try {
        const topicsData = await fetchTopics();
        setTopics(topicsData);
      } catch (err) {
        console.error(err);
        setTopics([]);
      }
    };
    getTopics();
  }, []);

  // Fetch questions whenever filters change
  useEffect(() => {
    const getQuestions = async () => {
      setLoading(true);
      setError("");
      try {
        const questionsData = await fetchQuestions(selectedTopic, selectedDifficulty);
        setQuestions(questionsData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch questions.");
      } finally {
        setLoading(false);
      }
    };
    getQuestions();
  }, [selectedTopic, selectedDifficulty]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} sx={{ fontWeight: "bold", color: "black" }}>
        Questions
      </Typography>

      <Filters
        topics={topics}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
      />

      {loading && <CircularProgress sx={{ color: "black" }} />}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        {questions.map((q) => (
          <QuestionCard key={q._id} question={q} />
        ))}
      </Box>
    </Box>
  );
};

export default QuestionsPage;
