import axios from 'axios';

// Create axios instance for the question microservice
const questionAxios = axios.create({
    baseURL: process.env.REACT_APP_QUESTION_SERVICE_URL || 'http://localhost:5052',
    timeout: 10000
});

// Add auth token if needed
questionAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const questionService = {
    async getQuestions(topic = "", difficulty = "") {
        const params = {};
        if (topic) params.topic = topic;
        if (difficulty) params.difficulty = difficulty;
        const { data } = await questionAxios.get('/questions', { params });
        return data.payload;
    },

    async getTopics() {
        const { data } = await questionAxios.get('/questions/topics');
        return data.payload;
    },

    async getQuestionById(id) {
        const { data } = await questionAxios.get(`/questions/internal/${id}`);
        return data.payload;
    },

    async getRandomQuestion(topic = "", difficulty = "") {
        const params = {};
        if (topic) params.topic = topic;
        if (difficulty) params.difficulty = difficulty;
        const { data } = await questionAxios.get('/questions/internal/random-question', { params });
        return data.payload;
    },

    async getLastQuestionId() {
        const { data } = await questionAxios.get('/questions/last-question-id');
        return data.payload;
    },

    async addQuestion(questionData) {
        const { data } = await questionAxios.post('/questions/add-question', questionData);
        return data;
    },
};

export default questionService;
