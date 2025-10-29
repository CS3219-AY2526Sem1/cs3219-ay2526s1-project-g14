const User = require("../model/userModel");
const TempUser = require("../model/tempUserModel");

const { generateToken, generateOtp, sendOTPEmail } = require("../middleware/auth");


const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    let pending = await TempUser.findOne({ email });
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (pending) {
      pending.username = username;
      pending.password = password;
      pending.otp = otp;
      pending.otpExpires = otpExpires;
      await pending.save();
      await sendOTPEmail(email, otp);
      return res.status(200).json({ message: "Email Not verified! OTP resent to your email" });
    }

    const newPending = new TempUser({ username, email, password, otp, otpExpires });
    await newPending.save();
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email. Verify to complete registration." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const pending = await TempUser.findOne({ email });
    if (!pending) return res.status(400).json({ message: "Pending user not found" });
    if (pending.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (pending.otpExpires < new Date()) return res.status(400).json({ message: "OTP expired" });

    const user = new User({
      username: pending.username,
      email: pending.email,
      password: pending.password,
    });

    await user.save();

    await TempUser.deleteOne({ email });
    const token = generateToken(user);
    res.status(201).json({
      message: "Registration complete",
      user: { _id: user._id, email: user.email, username: user.username },
      token
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    const pending = await TempUser.findOne({ email });
    if (!pending) return res.status(400).json({ message: "No pending registration found" });

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    pending.otp = otp;
    pending.otpExpires = otpExpires;
    await pending.save();

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "New OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("Comparing password for:", email);
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const upsertFirebase = async (req, res) => {
  try {
    let newUser = false;
    const { firebaseUid, email, username } = req.body;

    if (!firebaseUid || !email || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });

    if (!user) {
      user = new User({
        firebaseUid,
        email,
        username,
        password: null,
      });
      await user.save();
      console.log("Firebase user registered:", email);
    } else {
      newUser = true;
      console.log("Firebase user login:", email);
    }

    const token = generateToken(user);

    res.status(200).json({
      message: newUser ? "Firebase login successful" : "Firebase user registered successfully",
      token,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Firebase auth error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, upsertFirebase, resendOTP, verifyOTP };