import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import Welcome from "../components/home/Welcome";
import MatchingBox from "../components/home/MatchingBox";
import RecentQuestions from "../components/home/RecentQuestions";
import { fetchTopics } from "../controller/questionsController";
// import { fetchRecentQuestions } from "../controller/questionsController";

export default function Home() {
    const username = useSelector((state) => state.auth.username);

    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [recentQuestions, setRecentQuestions] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(false);

    useEffect(() => {
        fetchTopics().then(setTopics).catch(console.error);
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
                        <RecentQuestions recentQuestions={recentQuestions} loading={loadingRecent} />
                    </Box>
                </>
            )}
        </Box>
    )
}