import { Box, Typography, Chip, Divider, Paper} from "@mui/material";
import DescriptionSection from "./DescriptionSection";
import ExamplesSection from "./ExamplesSection";
import DifficultyChip from "../../DifficultyChip";

export default function QuestionPanel({ question }) {
    if (!question) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

    const {
        title = 'Loading...',
        description = '',
        examples = [],
        image = null,
        topic = [],
        difficulty
    } = question;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", paddingBottom: 1 }}>
                {title}
            </Typography>   
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ paddingBottom: 2 }}>
                <DifficultyChip difficulty={difficulty} />
                {topic.map((t, index) => (
                    <Chip
                        key={index}
                        label={t}
                        size="small"
                        sx={{
                            fontWeight: 'bold',
                            backgroundColor: '#e3f2fd',
                            color: '#0091f3',
                        }}
                    />
                ))}   
            </Box>

        <DescriptionSection description={description} />

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

        <Divider sx={{ my: 2 }} />
        <ExamplesSection examples={examples} />
        </Box>
    );
}