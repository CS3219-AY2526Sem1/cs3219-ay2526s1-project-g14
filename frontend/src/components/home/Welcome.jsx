import { Paper, Typography } from "@mui/material";

export default function Welcome({ username }) {
  return (
        <Paper sx={{ p: 3, backgroundColor: "white" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "black" }}>
                Welcome back, {username}!
            </Typography>
            <Typography mt={1}>
                Ready to practice? Select your preferred difficulty and topic to get matched with another user.
            </Typography>
        </Paper>
  );
}
