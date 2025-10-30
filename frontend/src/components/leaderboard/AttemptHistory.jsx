import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { handleFetchUserAttempts } from "../../store/actions/user";
import styles from "./styles.module.css";

const AttemptHistory = () => {
  const dispatch = useDispatch();
  const { attempts, loading } = useSelector((s) => s.user);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    dispatch(handleFetchUserAttempts());
  }, [dispatch]);

  const displayed = showAll ? attempts : attempts?.slice(0, 3) || [];

  return (
    <Card className={styles.historyCard}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" className={styles.title}>
          Recent Attempts
        </Typography>

        {loading ? (
          <Typography color="text.secondary" mt={1}>
            Loading...
          </Typography>
        ) : !attempts?.length ? (
          <Typography color="text.secondary" mt={1}>
            No attempts yet.
          </Typography>
        ) : (
          <>
            <Box className={styles.attemptList}>
              {displayed.map((a, i) => (
                <Box key={i} className={styles.attemptRow}>
                  <Typography className={styles.attemptQuestion}>
                    {a?.question?.payload?.title || "Bit Manipulation"}
                  </Typography>
                  <Typography className={a.status ? styles.pass : styles.fail}>
                    {a.status ? "Passed" : "Failed"}
                  </Typography>
                </Box>
              ))}
            </Box>

            {attempts.length > 3 && (
              <Button
                variant="text"
                size="small"
                endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowAll((s) => !s)}
                sx={{
                  textTransform: "none",
                  mt: 1,
                  color: "#6c5ce7",
                  fontSize: "0.8rem",
                }}
              >
                {showAll ? "Show Less" : "View More"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttemptHistory;
