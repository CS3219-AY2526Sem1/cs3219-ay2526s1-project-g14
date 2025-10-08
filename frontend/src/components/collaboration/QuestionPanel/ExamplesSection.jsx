import { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Collapse,
    Divider,
    Button,
    IconButton
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Code as CodeIcon,
    PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

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

        {/* Hints Section (Optional) */}
        {/* <Paper sx={{ mb: 2 }}>
            <Box
                sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={() => setShowHints(!showHints)}
            >
            <Box display="flex" alignItems="center" gap={1}>
                <CodeIcon sx={{ color: '#0091f3' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Approach Hints
                </Typography>
            </Box>
                <IconButton size="small">
                    {showHints ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
            </Box>
            
            <Collapse in={showHints}>
                <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Think about these approaches:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            Consider the time and space complexity requirements
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            Look for patterns in the examples
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            Think about edge cases and constraints
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Paper> */}
        </Box>
    );
}
