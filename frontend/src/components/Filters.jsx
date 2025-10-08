import { Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from "@mui/material";

export default function Filters({ topics, selectedTopic, setSelectedTopic, selectedDifficulty, setSelectedDifficulty, disabled = false }) {
    return (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <FormControl sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: "black" }}>Topic</InputLabel>
                <Select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    input={<OutlinedInput label="Topic" />}
                    disabled={disabled}
                    sx={{
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "black" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "black" },
                        "& .MuiSvgIcon-root": { color: "black" },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                            "& .MuiMenuItem-root:hover": {
                                backgroundColor: "#EDF2FF",
                            },
                            },
                        },
                    }}
                >
                <MenuItem value="">All</MenuItem>
                    {topics.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                        {topic}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: "black" }}>Difficulty</InputLabel>
                <Select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    input={<OutlinedInput label="Difficulty" />}
                    disabled={disabled}
                    sx={{
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "black" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "black" },
                        "& .MuiSvgIcon-root": { color: "black" },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                            "& .MuiMenuItem-root:hover": {
                                backgroundColor: "#EDF2FF",
                            },
                            },
                        },
                    }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
