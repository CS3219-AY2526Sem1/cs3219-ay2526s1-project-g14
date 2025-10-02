import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';

const AVAILABLE_USERS = [
    { id: "user123", userId: "user123", username: "Alice" },
    { id: "user456", userId: "user456", username: "Bob" },
    { id: "user789", userId: "user789", username: "Charlie" },
    { id: "user101", userId: "user101", username: "Diana" },
    { id: "user202", userId: "user202", username: "Eve" }
];

export default function UserSelector({ onUserSelected }) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Check if user is already selected in this session
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            onUserSelected(user);
        }
    }, [onUserSelected]);

    const handleUserSelect = () => {
        const selectedUser = AVAILABLE_USERS.find(user => user.id === selectedUserId);
        if (selectedUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(selectedUser));
            setCurrentUser(selectedUser);
            onUserSelected(selectedUser);
        }
    };

    const handleUserChange = () => {
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
        setSelectedUserId('');
    };

    if (currentUser) {
        return (
            <Paper sx={{ p: 3, mb: 3, border: "1px solid #0091f3", borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" sx={{ color: "#0091f3", fontWeight: "bold" }}>
                            Welcome, {currentUser.username}!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            User ID: {currentUser.userId}
                        </Typography>
                    </Box>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleUserChange}
                        sx={{ color: "#0091f3", borderColor: "#0091f3" }}
                    >
                        Switch User
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, mb: 3, border: "1px solid #ff9800", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: "#ff9800", fontWeight: "bold", mb: 2 }}>
                Select Your Test User
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
                For testing: Each browser window should select a different user to simulate two people collaborating.
            </Alert>

            <Box display="flex" gap={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Choose User</InputLabel>
                    <Select
                        value={selectedUserId}
                        label="Choose User"
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        {AVAILABLE_USERS.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.username} ({user.id})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Button
                    variant="contained"
                    onClick={handleUserSelect}
                    disabled={!selectedUserId}
                    sx={{
                        backgroundColor: "#0091f3",
                        "&:hover": { backgroundColor: "#0077c2" }
                    }}
                >
                    Select User
                </Button>
            </Box>
        </Paper>
    );
}
