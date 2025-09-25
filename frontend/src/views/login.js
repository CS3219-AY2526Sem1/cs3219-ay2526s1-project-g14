import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { handleSaveUsername } from "../store/actions/user"
import logo from '../logo.png'
import '../App.css';
import { useState } from 'react';

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, setUsername] = useState("")

    const handleSubmit = async () => {
        const result = await dispatch(handleSaveUsername(username));

        if (result) {
            navigate('/'); 
        } else {
            console.log('Failed');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <TextField
                    label="Name"
                    id="margin-normal"
                    name="name"
                    defaultValue={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </header>
        </div>
    );
};

export default Login;