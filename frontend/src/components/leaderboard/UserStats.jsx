import { Card, CardContent, Typography, Box, CircularProgress, Grid } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleFetchUserStats } from "../../store/actions/user";

const UserStats = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(handleFetchUserStats());
  }, [dispatch]);

  return (
    <Card
      sx={{
        width: "fit-content",
        minWidth: 260,
        borderRadius: 3,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        bgcolor: "#fff",
        p: 2,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: "8px !important",
        }}
      >
        {loading ? (
          <CircularProgress size={36} />
        ) : stats ? (
          <>
            {/* Circle Section */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 1,
              }}
            >
              <CircularProgress
                variant="determinate"
                value={stats.avgPassingRate || 0}
                size={90}
                thickness={5}
                sx={{
                  color: "#6c5ce7",
                  position: "absolute",
                  filter: "drop-shadow(0 0 4px rgba(108, 92, 231, 0.3))",
                }}
              />
              <Typography
                sx={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "#2d3436",
                }}
              >
                {Math.round(stats.avgPassingRate || 0)}%
              </Typography>
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              Success Rate
            </Typography>

            {/* Stats Grid */}
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs="auto" textAlign="center">
                <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  {stats.totalAttempts ?? 0}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", textTransform: "uppercase" }}
                >
                  Attempts
                </Typography>
              </Grid>
              <Grid item xs="auto" textAlign="center">
                <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  {stats.totalPassed ?? 0}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", textTransform: "uppercase" }}
                >
                  Solved
                </Typography>
              </Grid>
              <Grid item xs="auto" textAlign="center">
                <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  {stats.avgTime ? `${Math.round(stats.avgTime/60)} min` : "-"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", textTransform: "uppercase" }}
                >
                  Avg Time
                </Typography>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            No stats available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStats;
