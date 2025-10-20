import { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Typography,
    Paper,
    Chip,
    Collapse,
    Autocomplete
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { addQuestion, fetchTopics, fetchLastQuestionId } from "../controller/questionsController";
import AlertBox from "./AlertBox";

const difficulties = ["Easy", "Medium", "Hard"];

const AddQuestion = () => {
    const [form, setForm] = useState({
        questionId: "",
        title: "",
        description: "",
        difficulty: "Easy",
        topic: [],
        examples: [{ input: "", output: "" }],
        image: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [expandedExamples, setExpandedExamples] = useState([true]);
    const [topics, setTopics] = useState([]);
    
    const initForm = async () => {
        try {
            const topics = await fetchTopics();
            setTopics(topics);

            const lastQuestion = await fetchLastQuestionId();
            const nextId = lastQuestion?.questionId ? lastQuestion.questionId + 1 : 1;

            setForm((prev) => ({ ...prev, questionId: nextId }));
        } catch (err) {
            console.error("Error initializing form:", err);
        }
    };

    useEffect(() => {
        initForm();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleExampleChange = (index, field, value) => {
        const newExamples = [...form.examples];
        newExamples[index][field] = value;
        setForm((prev) => ({ ...prev, examples: newExamples }));
    };

    const addExample = () => {
        setForm((prev) => ({
            ...prev,
            examples: [...prev.examples, { input: "", output: "" }]
        }));
        setExpandedExamples((prev) => [...prev, true]);
    };

    const removeExample = (index) => {
        const newExamples = [...form.examples];
        newExamples.splice(index, 1);
        setForm((prev) => ({ ...prev, examples: newExamples }));

        const newExpanded = [...expandedExamples];
        newExpanded.splice(index, 1);
        setExpandedExamples(newExpanded);
    };

    const toggleExample = (index) => {
        const newExpanded = [...expandedExamples];
        newExpanded[index] = !newExpanded[index];
        setExpandedExamples(newExpanded);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await addQuestion(form);
            setMessage({ type: "success", text: "Question added successfully!" });

            // Reset form
            setForm({
                questionId: "",
                title: "",
                description: "",
                difficulty: "Easy",
                topic: [],
                examples: [{ input: "", output: "" }],
                image: "",
            });
            initForm()
            setExpandedExamples([true]);
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            display: "flex",
            flexGrow: 1,
            height: "100%",
            overflow: "hidden",
            p: 2,
            gap: 2
        }}>
        <Box sx={{
            width: { xs: "100%", md: "100%" },
            border: "1px solid #ddd",
            borderRadius: 2,
            bgcolor: "white",
            overflowY: "auto",
            p: 4,
        }}>            
            <Typography variant="h5" mb={3} sx={{ fontWeight: "bold", color: "black" }}>
                Add a New Question
            </Typography>

            <Box component="form" display="flex" flexDirection="column" gap={3} onSubmit={handleSubmit}>
                {/* Question ID */}
                <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Question ID</Typography>
                    <Chip
                        label={form.questionId}
                        sx={{
                            fontSize: "1rem",
                            fontWeight: "bold",
                            bgcolor: "#EDF2FF",
                            color: "#000",
                            border: "1px solid #000",
                            borderRadius: "8px",
                            px: 1.5,
                            py: 1,
                            "& .MuiChip-label": { px: 1.5 },
                        }}
                    />
                </Box>

                {/* Title */}
                <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Title</Typography>
                    <TextField
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                </Box>

                {/* Description */}
                <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Description</Typography>
                    <TextField
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                        required
                    />
                </Box>

                {/* Difficulty & Topic */}
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                    <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Difficulty</Typography>
                        <TextField
                            select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleChange}
                            fullWidth
                        >
                            {difficulties.map((level) => (
                                <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Topic</Typography>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={topics}
                            value={form.topic || []}
                            onChange={(e, newValue) =>
                                setForm((prev) => ({ ...prev, topic: newValue }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    placeholder="Select or type topics"
                                />
                            )}
                        />
                    </Box>
                </Box>

                <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Examples
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={addExample}
                            sx={{
                                ml: "auto",
                                bgcolor: "#FFFFFF",
                                borderColor: "#D6E0FF",
                                color: "#000",
                                "&:hover": { bgcolor: "#D6E0FF" },
                            }}
                        >
                            <AddIcon/>
                        </Button>
                    </Box>

                    {form.examples.map((ex, index) => (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9" }}
                        >
                        <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{ cursor: "pointer" }}
                            onClick={() => toggleExample(index)}
                        >
                            <PlayArrowIcon
                                sx={{
                                    transform: expandedExamples[index] ? "rotate(90deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s",
                                }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Example {index + 1}
                            </Typography>
                                {form.examples.length > 1 && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    sx={{ ml: "auto" }}
                                    onClick={() => removeExample(index)}
                                >
                                    <DeleteIcon/>
                                </Button>
                                )}
                        </Box>

                        <Collapse in={expandedExamples[index]}>
                            <Box mt={1} display="flex" flexDirection="column" gap={1}>
                                <TextField
                                    label="Input"
                                    value={ex.input}
                                    onChange={(e) => handleExampleChange(index, "input", e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Output"
                                    value={ex.output}
                                    onChange={(e) => handleExampleChange(index, "output", e.target.value)}
                                    fullWidth
                                    required
                                />
                            </Box>
                        </Collapse>
                        </Paper>
                    ))}
                </Box>

                {/* Image */}
                <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Image URL</Typography>
                    <TextField
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        fullWidth
                    />
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        bgcolor: "#EDF2FF",
                        color: "#000",
                        "&:hover": { bgcolor: "#D6E0FF" },
                        mt: 2,
                    }}
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Question"}
                </Button>

                <AlertBox message={message} setMessage={setMessage} />
            </Box>
        </Box>
        </Box>
    );
};

export default AddQuestion;
