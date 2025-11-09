import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import styles from "./styles.module.css";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const QuickLeaderboard = ({ data }) => {
  const username = useSelector((state) => state.auth.username);

  const encouragements = [
    "You're doing amazing — one step closer to the top!",
    "Keep it up! Progress is progress 💪",
    "Small wins make big changes 🌟",
    "Stay consistent — champions rise slowly 🏆",
    "Keep learning, keep growing 🚀",
  ];
  const randomMessage = useMemo(() => {
    const i = Math.floor(Math.random() * encouragements.length);
    return encouragements[i];
  }, []);

  if (!data || data.length === 0)
    return (
      <Card className={styles.card}>
        <CardContent>
          <Typography variant="h6" className={styles.title}>Leaderboard Snapshot</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No leaderboard data available.
          </Typography>
        </CardContent>
      </Card>
    );

  const getMedalIcon = (rank) => {
    if (rank === 1) return <EmojiEventsIcon sx={{ color: "#ffd700" }} />;
    if (rank === 2) return <EmojiEventsIcon sx={{ color: "#c0c0c0" }} />;
    if (rank === 3) return <EmojiEventsIcon sx={{ color: "#cd7f32" }} />;
    return null;
  };

  return (
    <Card className={styles.card}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", mb: 2 }}>
          Leaderboard
        </Typography>

        <Box className={styles.listContainer}>
          {data.map((u) => {
            const isCurrentUser = u.username === username;
            return (
              <Box
                key={u.rank}
                className={`${styles.userRow} ${isCurrentUser ? styles.currentUser : ""}`}
              >
                <Box className={styles.leftSection}>
                  {getMedalIcon(u.rank)}
                  <Avatar className={isCurrentUser ? styles.avatarSelf : styles.avatar}>
                    {u.rank < 10 ? `0${u.rank}` : u.rank}
                  </Avatar>
                  <Typography className={styles.username}>
                    {u.username}
                  </Typography>
                </Box>
                <Typography className={styles.score}>{u.score} pts</Typography>
              </Box>
            );
          })}
        </Box>

        <Box className={styles.motivationBox}>
          <TrendingUpIcon className={styles.motivationIcon} />
          <Typography className={styles.motivationText}>{randomMessage}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickLeaderboard;
