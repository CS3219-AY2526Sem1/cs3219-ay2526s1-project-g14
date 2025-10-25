import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Paper,
    CircularProgress,
    IconButton
} from "@mui/material";
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Editor from '@monaco-editor/react';
import collaborationService from '../../services/collaborationService';
import codeExecutionService from '../../services/codeExecutionService';

export default function CodeEditorPanel({ 
    sessionId, 
    code: parentCode, 
    language: parentLanguage,
    onCodeChange,
    onLanguageChange 
}) {
    const [code, setCode] = useState(parentCode || '');
    const [language, setLanguage] = useState(parentLanguage || 'javascript');
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState(null);
    const [showOutput, setShowOutput] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        setCode(parentCode || '');
    }, [parentCode]);

    useEffect(() => {
        setLanguage(parentLanguage || 'javascript');
    }, [parentLanguage]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (onCodeChange) {
            clearTimeout(window.codeUpdateTimeout);
            window.codeUpdateTimeout = setTimeout(() => {
                onCodeChange(newCode);
            }, 500);
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        if (onLanguageChange) {
            onLanguageChange(newLanguage);
        }
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleRunCode = async () => {
        setIsExecuting(true);
        setShowOutput(true);
        
        try {
            const result = await codeExecutionService.executeCode(code, language);
            console.log('Execution result:', result);
            console.log('showOutput:', true);
            setExecutionResult(result);
        } catch (error) {
            const errorResult = {
                success: false,
                output: '',
                error: error.message || 'An unexpected error occurred',
                executionTime: '0s'
            };
            console.log('Execution error:', errorResult);
            setExecutionResult(errorResult);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleClearOutput = () => {
        setExecutionResult(null);
    };

    const handleToggleOutput = () => {
        setShowOutput(!showOutput);
    };

    const getMonacoLanguage = (lang) => {
        const languageMap = {
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c++': 'cpp'
        };
        return languageMap[lang.toLowerCase()] || 'javascript';
    };

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            display: "flex", 
            flexDirection: "column",
            overflow: "auto",
            minHeight: 0
        }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CodeIcon />
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
                        startIcon={isExecuting ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                        onClick={handleRunCode}
                        disabled={isExecuting || !code.trim()}
                        sx={{
                            backgroundColor: "black",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "#333",
                            },
                            "&:disabled": {
                                backgroundColor: "#666",
                                color: "#ccc"
                            }
                        }}>
                        {isExecuting ? 'Running...' : 'Run Code'}
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minHeight: 0
                }}
            >
                {/* Monaco Editor */}
                <Box
                    sx={{
                        flex: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        minHeight: 0
                    }}
                >
                    <Editor
                        height="100%"
                        language={getMonacoLanguage(language)}
                        value={code}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        theme="vs-light"
                        loading={<div>Loading editor...</div>}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: 'on',
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            parameterHints: { enabled: true }
                        }}
                    />
                </Box>

                {/* Output Panel */}
                {executionResult && (
                <Paper
                    elevation={0}
                    sx={{
                        flex: showOutput ? '0 0 280px' : '0 0 50px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            bgcolor: '#f5f5f5',
                            borderBottom: '1px solid #e0e0e0'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Output
                            </Typography>
                            {executionResult && (
                                <Typography variant="caption" color="text.secondary">
                                    ({executionResult.executionTime})
                                </Typography>
                            )}
                        </Box>
                        <Box>
                            <IconButton size="small" onClick={handleClearOutput} title="Clear output">
                                <ClearIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleToggleOutput} title={showOutput ? "Minimize output" : "Expand output"}>
                                {showOutput ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {showOutput && (
                    <Box
                        sx={{
                            p: 2,
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            bgcolor: '#1e1e1e',
                            color: '#d4d4d4',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            flex: 1,
                            minHeight: 0,
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#2e2e2e',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#555',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#777',
                            }
                        }}
                    >
                            {isExecuting && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50' }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        Executing code...
                                    </Typography>
                                </Box>
                            )}

                            {!isExecuting && !executionResult && (
                                <Typography variant="body2" sx={{ color: '#888', fontFamily: 'monospace' }}>
                                    Click "Run Code" to see output here
                                </Typography>
                            )}

                            {!isExecuting && executionResult && (
                                <>
                                    {executionResult.output && (
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                                OUTPUT:
                                            </Typography>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                {executionResult.output}
                                            </pre>
                                        </Box>
                                    )}

                                    {executionResult.error && (
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                                ERROR:
                                            </Typography>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#f44336' }}>
                                                {executionResult.error}
                                            </pre>
                                        </Box>
                                    )}

                                    {executionResult.success && !executionResult.output && (
                                        <Typography variant="body2" sx={{ color: '#4CAF50', fontFamily: 'monospace' }}>
                                            ✓ Code executed successfully (no output)
                                        </Typography>
                                    )}
                                </>
                            )}
                    </Box>
                    )}
                </Paper>
                )}
            </Box>
        </Box>
    );
}
