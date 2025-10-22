import { API } from '../constants/api';
import axiosInstance from '../config/axios';

export const fetchQuestions = async(topic="", difficulty="") => {
    const params = {}
    if (topic) params.topic = topic;
    if (difficulty) params.difficulty = difficulty;
    const { data } = await axiosInstance.get(API.QUESTIONS, {params})
    return data.payload;
}

export const getQuestionById = async (id) => {
    try {
        const { data } = await axiosInstance.get(`${API.QUESTIONS}/${id}`);
        return data.payload;
    } catch (error) {
        console.error("Error fetching question by ID:", error);
        throw error;
    }
};

export const fetchTopics = async() => {
    const { data } = await axiosInstance.get(API.TOPICS);
    return data.payload
}

export const fetchOneQuestion = async(topic="", difficulty="") => {
    const params = {}
    if (topic) params.topic = topic;
    if (difficulty) params.difficulty = difficulty;
    const { data } = await axiosInstance.get(API.RANDOMQUESTION, {params})
    return data.payload;
}

export const fetchLastQuestionId = async() => {
    const { data } = await axiosInstance.get(API.LASTQUESTIONID);
    return data.payload
}

export const addQuestion = async (questionData) => {
    try {
        const { data } = await axiosInstance.post(API.ADDQUESTION, questionData);
        return data;
    } catch (error) {
        console.error("Error adding question:", error);
        throw error;
    }
};