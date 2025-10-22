import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, CircularProgress, Fade, Grid } from "@mui/material";
import { fetchLeaderboard } from "../store/actions/leaderboard";
import LTabs from "../components/leaderboard/LTabs";
import LList from "../components/leaderboard/List";
import UserStats from "../components/leaderboard/UserStats";
import AttemptHistory from "../components/leaderboard/AttemptHistory";
import styles from "../components/leaderboard/styles.module.css";

const Leaderboard = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("overall");
  const data = useSelector((state) => state.leaderboard[tab]);

  useEffect(() => {
    dispatch(fetchLeaderboard(tab));
  }, [tab, dispatch]);

  const tabDescriptions = {
    overall:
      "Overall leaderboard combines accuracy, streak, and completion speed to determine your total score.",
    speed:
      "Speed leaderboard ranks users based on their average completion time across all solved questions.",
    streak:
      "Streak leaderboard highlights users with the longest consecutive daily practice streaks.",
  };

  return (
    <Fade in timeout={300}>
      <Box className={styles.pageWrapper}>
        <Grid container spacing={2} className={styles.topSection}>
          <Grid item xs={12} md={8}>
            <UserStats />
          </Grid>
          <Grid item xs={12} md={4}>
            <AttemptHistory />
          </Grid>
        </Grid>

        <Box className={styles.leaderboardSection}>
          <Typography variant="h6" mb={1.5} className={styles.sectionTitle}>
            Global Leaderboard
          </Typography>

          <LTabs tab={tab} setTab={setTab} />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, fontSize: "0.8rem", textAlign: "center" }}
          >
            {tabDescriptions[tab]}
          </Typography>

          {!data.length ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <LList data={data} />
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default Leaderboard;
