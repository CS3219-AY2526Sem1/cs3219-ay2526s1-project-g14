const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { jwtSecret, jwtExpire } = require("../config/jwt");
const { transporter } = require("../config/otp");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, username: user.username },
        jwtSecret,
        { expiresIn: jwtExpire }
    );
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
};


const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"PeerPrep" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OTP Code for PeerPrep",
            text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
            html: ` <p>
                        Your OTP code is: <b>${otp}</b>
                    </p>
                    <p>It expires in 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
    } catch (err) {
        console.error("Error sending OTP email:", err);
        throw new Error("Failed to send OTP email");
    }
};


module.exports = { authMiddleware, generateToken, generateOtp, sendOTPEmail };
