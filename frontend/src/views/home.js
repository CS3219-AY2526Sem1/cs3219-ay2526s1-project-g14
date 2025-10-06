import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Welcome from "../components/home/Welcome";
import MatchingBox from "../components/home/MatchingBox";
import RecentQuestions from "../components/home/RecentQuestions";
import UserSelector from "../components/UserSelector";
import { fetchTopics } from "../controller/questionsController";
// import { fetchRecentQuestions } from "../controller/questionsController";

export default function Home() {

    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [recentQuestions, setRecentQuestions] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    useEffect(() => {
        fetchTopics().then(setTopics).catch(console.error);
    }, []);

    return (
        <Box p={3} display="flex" flexDirection="column" gap={4}>
            <UserSelector onUserSelected={setCurrentUser} />
            
            {currentUser && (
                <>
                    <Welcome username={currentUser.username} />
                    <Box display="flex" gap={3} flexWrap="wrap">
                        <MatchingBox
                            topics={topics}
                            selectedTopic={selectedTopic}
                            setSelectedTopic={setSelectedTopic}
                            selectedDifficulty={selectedDifficulty}
                            setSelectedDifficulty={setSelectedDifficulty}
                            currentUser={currentUser}
                        />
                        <RecentQuestions recentQuestions={recentQuestions} loading={loadingRecent} />
                    </Box>
                </>
            )}
        </Box>
    )
}