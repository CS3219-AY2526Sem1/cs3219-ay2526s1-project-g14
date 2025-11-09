import questionService from '../services/questionService';

export const fetchQuestions = (topic, difficulty) => questionService.getQuestions(topic, difficulty);
export const getQuestionById = (id) => questionService.getQuestionById(id);
export const fetchTopics = () => questionService.getTopics();
export const fetchOneQuestion = (topic, difficulty) => questionService.getRandomQuestion(topic, difficulty);
export const fetchLastQuestionId = () => questionService.getLastQuestionId();
export const addQuestion = (data) => questionService.addQuestion(data);