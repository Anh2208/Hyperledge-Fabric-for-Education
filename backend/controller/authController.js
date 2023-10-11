import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import bcrypt from "bcryptjs";
import { create_user } from "./hyperledgerController.js";

//create new student
export const createStudent = async (req, res) => {

    try {

        create_user(req.body.email);

        let saveStudent = await Student.create({
            name: req.body.name,
            email: req.body.email,
            mssv: req.body.mssv,
            password: req.body.password,
        });
        // dateofbirth: req.body.dateofbirth,
        // publicKey: keys.publicKey

        res.status(200).json({ success: true, message: "Create student successfully!!!", data: saveStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create student. Try again" });
    }
}

// create new Teacher
export const createTeacher = async (req, res) => {

    try {

        create_user(req.body.email);

        let saveTeacher = await Teacher.create({
            name: req.body.name,
            email: req.body.email,
            msgv: req.body.msgv,
            password: req.body.password,
        });
        // dateofbirth: req.body.dateofbirth,
        // publicKey: keys.publicKey

        res.status(200).json({ success: true, message: "Create student successfully!!!", data: saveTeacher });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create teacher. Try again" });
    }
}

export const studentLogin = async (req, res) => {
    const email = req.body.email;

    try {
        const student = await Student.findOne({ email });

        //if student doesn't exit
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const checkCorrectPassword = await bcrypt.compare(req.body.password, student.password);
        
        // if password is incorrect
        if (!checkCorrectPassword) {
            return res.status(401).json({ success: false, message: "Incorrect email or password" });
        }

        //create token
        // const { password, role, ...rest } = user._doc;

        // // create jwt token
        // const token = jwt.sign(
        //     { id: user._id, role: user.role },
        //     process.env.JWT_SECRET_KEY,
        //     { expiresIn: "15d" }
        // );

        // // set token in the browser cookies and send the response to the client
        // res
        //     .cookie("accessToken", token, {
        //         httpOnly: true,
        //         expires: token.expiresIn,
        //     })
        //     .status(200)
        //     .json({
        //         token,
        //         data: { ...rest },
        //         role,
        //     });
        res.status(200).json({ success: true, message: "Student login successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to student login" });
    }
}