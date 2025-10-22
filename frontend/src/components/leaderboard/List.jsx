import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import styles from "./styles.module.css";
import { useSelector } from "react-redux";

const List = ({ data }) => {
  const currentUser = useSelector((s) => s.auth.username);

  if (!data || !data.length)
    return <Typography color="text.secondary" textAlign="center">No data found</Typography>;

  const getMedal = (rank) => {
    if (rank === 1) return <EmojiEventsIcon sx={{ color: "#f5c542" }} />;
    if (rank === 2) return <EmojiEventsIcon sx={{ color: "#a6a6a6" }} />;
    if (rank === 3) return <EmojiEventsIcon sx={{ color: "#d99255" }} />;
    return null;
  };

  return (
    <Card className={styles.leaderboardCard}>
      <CardContent sx={{ p: 1.5 }}>
        {data.map((user) => {
          const isCurrent = user.username === currentUser;
          return (
            <Box
              key={user.rank}
              className={`${styles.userRow} ${isCurrent ? styles.currentUser : ""}`}
            >
              <Box className={styles.left}>
                <Box className={styles.medal}>{getMedal(user.rank)}</Box>
                <Avatar
                  className={isCurrent ? styles.avatarSelf : styles.avatar}
                  sx={{ width: 28, height: 28, fontSize: "0.9rem" }}
                >
                  {user.rank < 10 ? `0${user.rank}` : user.rank}
                </Avatar>
                <Typography className={styles.username}>
                  {user.username}
                </Typography>
              </Box>
              <Typography className={styles.score}>{user.score} pts</Typography>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default List;
