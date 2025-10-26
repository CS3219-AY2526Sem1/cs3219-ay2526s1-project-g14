import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import AddQuestion from "../components/AddQuestion";
import { Typography } from "@mui/material";
import { getRoleById } from "../controller/userController";

const AdminAddQuestion = () => {
    const userId = useSelector((state) => state.auth.id)
    const [role, setRole] = useState(null)

    useEffect(() => {
        if (userId) {
            async function fetchRole() {
                const r = await getRoleById(userId);
                    setRole(r);
                }
            fetchRole();
        }
    }, [userId]);

    if (role !== "admin") {
        return (
            <Typography color="error" align="center" sx={{ mt: 4 }}>
                Access denied. Only admins can add questions.
            </Typography>
        );
    }

    return <AddQuestion />;
};  

export default AdminAddQuestion;
