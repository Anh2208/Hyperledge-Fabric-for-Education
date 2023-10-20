import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js"

//get all student
export const getAllStudent = async (req, res) => {
  const student = await Student.find({});

  try {
    res
      .status(200)
      .json({ success: true, message: "List all student", data: student });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to find all student. Please try again",
      });
  }
};

//get all teacher
export const getAllTeacher = async (req, res) => {
  const teacher = await Teacher.find({});

  try {
    res
      .status(200)
      .json({ success: true, message: "List all teacher", data: teacher });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to find all teacher. Please try again",
      });
  }
};

//get all teacher
export const getAllAdmin = async (req, res) => {
  const admin = await Admin.find({});

  try {
    res
      .status(200)
      .json({ success: true, message: "List all Admin", data: admin });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to find all Admin. Please try again",
      });
  }
};
