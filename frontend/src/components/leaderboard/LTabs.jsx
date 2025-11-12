import { Tabs, Tab, Box } from "@mui/material";

const LTabs = ({ tab, setTab }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "#e0dff7", mb: 1 }}>
      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        textColor="secondary"
        indicatorColor="secondary"
        variant="fullWidth"
        sx={{
          minHeight: 32,
          "& .MuiTab-root": {
            minHeight: 32,
            fontSize: "0.9rem",
            textTransform: "none",
          },
        }}
      >
        <Tab label="Overall" value="overall" />
        <Tab label="Speed" value="speed" />
        <Tab label="Streak" value="streak" />
      </Tabs>
    </Box>
  );
};

export default LTabs;
