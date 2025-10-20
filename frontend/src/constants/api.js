
export const API = {

    USER: "/user",

    // Authentication routes
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    RESEND_OTP: "/auth/resend-otp",
    VERIFY_OTP: "/auth/verify-otp",
    FIREBASE_AUTH: "/auth/firebase",

    USER: "/user",
    QUESTIONS: "/questions",
    RANDOMQUESTION: "/questions/random-question",
    TOPICS: "/topics",
    LASTQUESTIONID: "/last-question-id",
    ADDQUESTION: "/add-question"
};

export const MATCHING_API = {
    START: "/matching/start",
    STATUS: (id) => `/matching/${id}/status`,
    CANCEL: (id) => `/matching/${id}/cancel`,
  };
  
