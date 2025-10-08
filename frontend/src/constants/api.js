
export const API = {

    USER: "/user",

    // Authentication routes
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    RESEND_OTP: "/auth/resend-otp",
    VERIFY_OTP: "/auth/verify-otp",
    FIREBASE_AUTH: "/auth/firebase",

    QUESTIONS: "/questions",
    RANDOMQUESTION: "/questions/random",
    TOPICS: "/topics",

};

export const MATCHING_API = {
    START: "/api/matching/start",
    STATUS: (id) => `/api/matching/${id}/status`,
    CANCEL: (id) => `/api/matching/${id}/cancel`,
  };
  
