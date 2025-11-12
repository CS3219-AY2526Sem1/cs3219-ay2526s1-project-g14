import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import DifficultyChip from "../DifficultyChip";
import { handleFetchUserAttempts } from "../../store/actions/user";

const AttemptHistory = () => {
  const dispatch = useDispatch();
  const { attempts, loading } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(handleFetchUserAttempts());
  }, [dispatch]);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#FFFFFF",
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recent Attempts
        </Typography>

        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : !attempts?.length ? (
          <Typography color="text.secondary">No attempts yet.</Typography>
        ) : (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexGrow: 1,
              overflowX: "auto", 
              overflowY: "hidden",
              pb: 1,
              "&::-webkit-scrollbar": {
                height: 6,
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#c1c1c1",
                borderRadius: 3,
              },
            }}
          >
            {attempts.map((a, i) => {
              const topics = a?.question?.payload?.topic || [];

              return (
                <Box
                  key={i}
                  flexShrink={0}
                  width={260} 
                  p={1.5}
                  borderRadius={2}
                  sx={{
                    bgcolor: "#EDF2FF",
                    transition: "0.2s",
                    "&:hover": { boxShadow: 2 },
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    noWrap
                    sx={{ maxWidth: "100%" }}
                  >
                    {a?.question?.payload?.title || "Untitled Question"}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                    <DifficultyChip
                      difficulty={a?.question?.payload?.difficulty || "Unknown"}
                    />
                    {topics.map((t, idx) => (
                      <Chip
                        key={idx}
                        label={t}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.75rem",
                          borderColor: "#bdbdbd",
                          color: "#616161",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default AttemptHistory;
