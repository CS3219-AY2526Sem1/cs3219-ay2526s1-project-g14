import { Card, CardContent, Typography, Box, CircularProgress, Grid } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleFetchUserStats } from "../../store/actions/user";
import styles from "./styles.module.css";

const UserStats = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(handleFetchUserStats());
  }, [dispatch]);

  return (
    <Card className={styles.statsCard}>
      <CardContent className={styles.statsContent}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" width="100%">
            <CircularProgress size={32} />
          </Box>
        ) : stats ? (
          <>
            {/* Circle Section */}
            <Box className={styles.circleWrapper}>
              <Box className={styles.circleOuter}>
                <CircularProgress
                  variant="determinate"
                  value={stats.avgPassingRate || 0}
                  size={90}
                  thickness={5}
                  className={styles.circleProgress}
                />
                <Typography className={styles.circleText}>
                  {Math.round(stats.avgPassingRate || 0)}%
                </Typography>
              </Box>
              <Typography className={styles.circleLabel}>Success Rate</Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={2} className={styles.statsGrid}>
              <Grid item xs={4}>
                <Typography className={styles.statValue}>
                  {stats.totalAttempts ?? 0}
                </Typography>
                <Typography className={styles.statLabel}>Attempts</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography className={styles.statValue}>
                  {stats.totalPassed ?? 0}
                </Typography>
                <Typography className={styles.statLabel}>Solved</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography className={styles.statValue}>
                  {stats.avgTime ?? "-"} ms
                </Typography>
                <Typography className={styles.statLabel}>Avg Time</Typography>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography color="text.secondary">No stats available.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStats;
