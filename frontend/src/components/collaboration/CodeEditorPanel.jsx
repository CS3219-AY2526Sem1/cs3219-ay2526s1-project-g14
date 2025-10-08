import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import CodeIcon from '@mui/icons-material/Code';
import collaborationService from '../../services/collaborationService';

export default function CodeEditorPanel({ sessionId, code: parentCode, language: parentLanguage }) {
    const [code, setCode] = useState(parentCode || '');
    const [language, setLanguage] = useState(parentLanguage || 'javascript');

    useEffect(() => {
        setCode(parentCode || '');
    }, [parentCode]);

    useEffect(() => {
        setLanguage(parentLanguage || 'javascript');
    }, [parentLanguage]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        clearTimeout(window.codeUpdateTimeout);
        window.codeUpdateTimeout = setTimeout(() => {
            collaborationService.sendCodeChange(sessionId, newCode, language);
        }, 500);
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        collaborationService.sendCodeChange(sessionId, code, newLanguage);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 2, display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CodeIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Code Editor
                    </Typography>
                </Box>
                <Box>
                    <FormControl size="small" sx={{ minWidth: 120, paddingRight: 1 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={language}
                            label="Language"
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                            <MenuItem value="java">Java</MenuItem>
                            <MenuItem value="cpp">C++</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "black",
                            color: "white",
                            "&:hover": {
                            backgroundColor: "#333", // slightly lighter on hover
                            },
                        }}>
                        Run Code
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    bgcolor: "#f8f9fa",
                    borderRadius: 1,
                    p: 2,
                    fontFamily: "monospace",
                    color: "#333",
                }}
            >
                <TextField
                    multiline
                    fullWidth
                    rows={15}
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Start coding here..."
                    variant="outlined"
                    sx={{
                        flex: 1,
                        '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        height: '100%'
                        },
                        '& .MuiInputBase-input': {
                        height: '100% !important',
                        overflow: 'auto !important'
                        }
                    }}
                />
            </Box>
        </Box>
    );
}
