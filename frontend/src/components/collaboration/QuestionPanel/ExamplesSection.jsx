import { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Collapse,
    Button,
} from "@mui/material";
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';

    export default function ExamplesSection({ examples }) {
    const [expanded, setExpanded] = useState(() => examples.map(() => false));
    
    const handleExampleToggle = (index) => {
        setExpanded(prev => {
        const newExpanded = [...prev];
        newExpanded[index] = !newExpanded[index];
        return newExpanded;
        });
    };

    const handleExpandAll = () => {
        setExpanded(prev => prev.every(v => v) ? examples.map(() => false) : examples.map(() => true));
    };

    return (
        <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", pr: 2, pb: 1 }}>
                Examples
            </Typography>
            <Button 
                size="small" 
                onClick={handleExpandAll} 
                sx={{
                    ml: "auto",
                    bgcolor: "#EDF2FF",  
                    color: "#000",          
                    "&:hover": {
                    bgcolor: "#D6E0FF", 
                    },
                }}
                variant="contained" 
            >
                {expanded.every(v => v) ? "Collapse All" : "Expand All"}
            </Button>
        </Box>

        {examples.map((example, index) => {
            const isExpanded = expanded[index];
            return (
            <Box key={index} sx={{ mb: 1 }}>
                <Box
                sx={{
                    p: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&:hover": { bgcolor: "#EDF2FF" },
                }}
                onClick={() => handleExampleToggle(index)}
                >
                <PlayArrowIcon
                    sx={{
                    color: "gray",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Example {index + 1}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: "auto", fontStyle: "italic" }}>
                    Click to {isExpanded ? "collapse" : "expand"}
                </Typography>
                </Box>

                <Collapse in={isExpanded}>
                    <Box sx={{ p: 2, pt: 1 }}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                Input:
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{ p: 1.5, bgcolor: "#f8f9fa", fontSize: "0.875rem", fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                            >
                                {example.input}
                            </Paper>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                Output:
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{ p: 1.5, bgcolor: "#e8f5e8", fontSize: "0.875rem", fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                            >
                                {example.output}
                            </Paper>
                        </Box>
                    </Box>
                </Collapse>

                {index < examples.length - 1}
            </Box>
            );
        })}
        </Box>
    );
}
