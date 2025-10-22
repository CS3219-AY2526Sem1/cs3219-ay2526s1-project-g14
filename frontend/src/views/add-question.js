import { useSelector } from "react-redux";
import AddQuestion from "../components/AddQuestion";
import { Typography } from "@mui/material";

const AdminAddQuestion = () => {
    const role = useSelector((state) => state.auth.role);

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
