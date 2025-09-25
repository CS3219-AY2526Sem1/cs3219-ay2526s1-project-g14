import { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const username = useSelector(state => state.user.username);
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (username=="") {
    //         navigate("/login");
    //     }
    // })
    return (
        <div>
            Hello {username}!
        </div>
    );
};

export default Home;