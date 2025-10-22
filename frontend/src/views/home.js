import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";
import Welcome from "../components/home/Welcome";
import MatchingBox from "../components/home/MatchingBox";
import RecentQuestions from "../components/home/RecentQuestions";
import QuickLeaderboard from "../components/home/leaderboard/QuickLeaderboard";
import { fetchQuickLeaderboard } from "../store/actions/leaderboard";
import { fetchTopics } from "../controller/questionsController";
// import { fetchRecentQuestions } from "../controller/questionsController";

export default function Home() {
    const username = useSelector((state) => state.auth.username);
    const dispatch = useDispatch();
    const quickLeaderboard = useSelector((state) => state.leaderboard.quick);

    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [recentQuestions, setRecentQuestions] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(false);

    useEffect(() => {
        fetchTopics().then(setTopics).catch(console.error);
        dispatch(fetchQuickLeaderboard());
    }, []);

    return (
        <Box p={3} display="flex" flexDirection="column" gap={4}>
            {username && (
                <>
                    <Welcome username={username} />
                    <Box display="flex" gap={3} flexWrap="wrap">
                        <MatchingBox
                            topics={topics}
                            selectedTopic={selectedTopic}
                            setSelectedTopic={setSelectedTopic}
                            selectedDifficulty={selectedDifficulty}
                            setSelectedDifficulty={setSelectedDifficulty}
                            username={username}
                        />
                        <QuickLeaderboard data={quickLeaderboard} />
                    </Box>
                </>
            )}
        </Box>
    )
}