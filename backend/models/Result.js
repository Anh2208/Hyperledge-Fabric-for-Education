import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    groupMa: {
      type: String,
      required: true,
    },
    subjectMS: {
      type: String,
      required: true,
    },
    studentMS: {
      type: String,
      required: true,
    },
    subjectTen: {
      type: String,
    },
    studentName: {
      type: String,
      // required: true,
    },
    teacherMS: {
      type: String,
      required: true,
    },
    subjectSotc: {
      type: String,
    },
    score: {
      type: Number,
      max: 10,
      min: 0,
    },
    semester: {
      type: Number,
      required: true,
      max: 4,
      min: 0,
    },
    date_awarded: {
      type: String,
      default: new Date().getFullYear().toString(), // Lấy năm hiện tại và chuyển thành chuỗi
      match: /^\d{4}$/, // Sử dụng biểu thức chính quy để đảm bảo chỉ lưu năm (ví dụ: "2022")
    },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);
// Result.createIndexes();

export default Result;
