import { API } from '../constants/api';
import { axiosInstance } from '../config/axios';

export const fetchQuestions = async(topic="", difficulty="") => {
    const params = {}
    if (topic) params.topic = topic;
    if (difficulty) params.difficulty = difficulty;
    const { data } = await axiosInstance.get(API.QUESTIONS, {params})
    return data.payload;
}

export const fetchTopics = async() => {
    const { data } = await axiosInstance.get(API.TOPICS);
    return data.payload
}