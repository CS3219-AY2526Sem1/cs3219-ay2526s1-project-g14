import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Card,
    CardContent,
    IconButton,
    Collapse
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Code as CodeIcon,
    PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import DifficultyChip from '../DifficultyChip';

export default function QuestionDisplay({ question, questionMetadata, difficulty, topics }) {
    const [showHints, setShowHints] = useState(false);
    const [expandedExample, setExpandedExample] = useState(null);

    // Use questionMetadata if available, fallback to question object
    const displayData = questionMetadata || question || {};
    const {
        title = 'Loading...',
        description = '',
        examples = [],
        image = null,
        topics: questionTopics = topics || []
    } = displayData;

    const handleExampleToggle = (index) => {
        setExpandedExample(expandedExample === index ? null : index);
    };

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            {/* Question Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0091f3', mb: 1 }}>
                    {title}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                    <DifficultyChip difficulty={difficulty} />
                    {questionTopics.map((topic, index) => (
                        <Chip
                            key={index}
                            label={topic}
                            size="small"
                            sx={{
                                fontWeight: 'bold',
                                backgroundColor: '#e3f2fd',
                                color: '#0091f3',
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Question Content */}
            <Box sx={{ p: 2 }}>
                {/* Description */}
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        Problem Description
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: 1.6,
                            '& p': { mb: 1 },
                            '& code': {
                                backgroundColor: '#f1f3f4',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.9em'
                            }
                        }}
                    >
                        {description || 'No description available.'}
                    </Typography>
                </Paper>

                {/* Image Display */}
                {image && (
                    <Paper sx={{ p: 2, mb: 2, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                            Visual Reference
                        </Typography>
                        <Box
                            component="img"
                            src={image}
                            alt="Question diagram"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                objectFit: 'contain',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <Typography 
                            variant="body2" 
                            color="error" 
                            sx={{ display: 'none', mt: 1 }}
                        >
                            Image could not be loaded
                        </Typography>
                    </Paper>
                )}

                {/* Examples */}
                {examples && examples.length > 0 && (
                    <Paper sx={{ mb: 2 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                Examples
                            </Typography>
                        </Box>
                        {examples.map((example, index) => (
                            <Box key={index}>
                                <Box
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#f5f5f5' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                    onClick={() => handleExampleToggle(index)}
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PlayArrowIcon 
                                            sx={{ 
                                                color: '#0091f3',
                                                transform: expandedExample === index ? 'rotate(90deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s'
                                            }} 
                                        />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Example {index + 1}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Click to {expandedExample === index ? 'collapse' : 'expand'}
                                    </Typography>
                                </Box>
                                
                                <Collapse in={expandedExample === index}>
                                    <Box sx={{ p: 2, pt: 0 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#666' }}>
                                                Input:
                                            </Typography>
                                            <Card sx={{ bgcolor: '#f8f9fa' }}>
                                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                            fontSize: '0.9em'
                                                        }}
                                                    >
                                                        {example.input}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                        
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#666' }}>
                                                Output:
                                            </Typography>
                                            <Card sx={{ bgcolor: '#e8f5e8' }}>
                                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                            fontSize: '0.9em'
                                                        }}
                                                    >
                                                        {example.output}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    </Box>
                                </Collapse>
                                
                                {index < examples.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Paper>
                )}

                {/* Hints Section (Optional) */}
                <Paper sx={{ mb: 2 }}>
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
                                💡 Think about these approaches:
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
                </Paper>
            </Box>
        </Box>
    );
}
