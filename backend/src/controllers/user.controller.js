import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"

import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const normalizeEmail = (email) => {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

const validateEmail = (email) => {
    if (!email) {
        return "email is required.";
    }

    if (!emailPattern.test(email)) {
        return "Please enter a valid email address.";
    }

    return "";
}

const validatePassword = (password) => {
    if (!password) {
        return "Password is required.";
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters.";
    }

    if (!strongPasswordPattern.test(password)) {
        return "Password must contain an uppercase letter, lowercase letter, number and special character.";
    }

    return "";
}

const login = async (req, res) => {

    const { password } = req.body;
    const email = normalizeEmail(req.body.email || req.body.username);

    const emailError = validateEmail(email);
    if (emailError) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: emailError })
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: passwordError })
    }

    try {
        const user = await User.findOne({ $or: [{ email }, { username: email }] });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            if (!user.email) {
                user.email = email;
            }
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email || req.body.username);

    if (!name || !name.trim()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Full name is required." });
    }

    const emailError = validateEmail(email);
    if (emailError) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: passwordError });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username: email }] });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: email,
            username: email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }

}


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" })
        }

        const userIdentifiers = [user.email, user.username].filter(Boolean);
        const meetings = await Meeting.find({ user_id: { $in: userIdentifiers } })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" })
        }

        const newMeeting = new Meeting({
            user_id: user.email || user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


export { login, register, getUserHistory, addToHistory }
