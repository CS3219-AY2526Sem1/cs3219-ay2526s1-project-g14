
export const API = {

    USER: "/user",

    // Authentication routes
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    RESEND_OTP: "/auth/resendOtp",
    VERIFY_OTP: "/auth/verifyOtp",
    FIREBASE_AUTH: "/auth/firebase",

    // user routes
    USER: "/user",
    USER_BY_ID: (id) => `/user/${id}`,
    USER_UPDATE_USERNAME: "/user/updateUsername",
    USER_UPDATE_PASSWORD: "/user/updatePassword",
    USER_CHANGE_EMAIL_REQUEST: "/user/changeEmail/request",
    USER_CHANGE_EMAIL_VERIFY: "/user/changeEmail/verify",
    USER_DELETE: "/user/delete",

    // attempts routes
    USER_ATTEMPTS: "/attempt",
    USER_STATS: "/attempt/stats",

    // leaderboard routes
    LEADERBOARD: (type = "overall") => `/leaderboard/${type}`,
    LEADERBOARD_HOME: "/leaderboard/home",
};

export const MATCHING_API = {
    START: "/matching/start",
    STATUS: (id) => `/matching/${id}/status`,
    CANCEL: (id) => `/matching/${id}/cancel`,
};

