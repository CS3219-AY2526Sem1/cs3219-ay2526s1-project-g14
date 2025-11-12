import { Modal, Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RejoinSessionModal({ open, onClose, sessionId, onEndSession }) {
    const navigate = useNavigate();

    const handleRejoin = () => {
        navigate(`/collaboration/${sessionId}`);
        onClose();
    };

    const handleEndAndStart = async () => {
        await onEndSession();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={() => {}} // Disable closing by clicking backdrop
            aria-labelledby="rejoin-session-modal"
            disableEscapeKeyDown // Prevent closing with ESC key
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 0,
                    borderRadius: 2,
                    outline: 'none',
                }}
            >
                <Paper elevation={0} sx={{ p: 4 }}>
                    <Typography 
                        id="rejoin-session-modal" 
                        variant="h5" 
                        component="h2" 
                        sx={{ mb: 2, fontWeight: 'bold' }}
                    >
                        Active Session Found
                    </Typography>
                    
                    <Typography sx={{ mb: 3, color: 'text.secondary' }}>
                        You have an active collaboration session. Would you like to rejoin it or end it to start a new match?
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            onClick={handleRejoin}
                            variant="contained"
                            fullWidth
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#1976d2',
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: '#1565c0'
                                }
                            }}
                        >
                            Rejoin Session
                        </Button>
                        
                        <Button
                            onClick={handleEndAndStart}
                            variant="outlined"
                            color="error"
                            fullWidth
                            sx={{
                                textTransform: 'none',
                                py: 1.5,
                            }}
                        >
                            End Session & Start New
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
}
