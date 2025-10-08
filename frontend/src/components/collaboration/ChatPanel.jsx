import {
    Box,
    Typography,
    List,
    ListItem,
    TextField,
    IconButton,
} from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from "@mui/icons-material/Send";

export default function ChatPanel({
    chatMessages,
    userId,
    newMessage,
    setNewMessage,
    handleSendMessage,
}) {
    return (
        <Box sx={{
            height: "100%",
            gap: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            p: 2,
        }}>

        <Box sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <ChatIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Chat</Typography>
        </Box>

        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 1, bgcolor: "#f8f9fa", borderRadius: 1 }}>
            <List dense>
                {chatMessages.map((message, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            flexDirection: "column",
                            alignItems:
                            message.userId === userId ? "flex-end" : "flex-start",
                            py: 0.5,
                        }}
                    >
                    <Box
                        sx={{
                            backgroundColor:
                                message.userId === userId ? "#0091f3" : "#f5f5f5",
                            color: message.userId === userId ? "white" : "black",
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            maxWidth: "80%",
                        }}
                    >
                        <Typography variant="caption" display="block">
                            {message.username}
                        </Typography>
                        <Typography variant="body2">{message.message}</Typography>
                    </Box>
                    </ListItem>
                ))}
            </List>
        </Box>

        {/* Chat Input */}
        <Box sx={{ p: 1 }}>
            <Box display="flex" gap={1}>
            <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                }}
            />
            <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
            >
                <SendIcon />
            </IconButton>
            </Box>
        </Box>
        </Box>
    );
}
