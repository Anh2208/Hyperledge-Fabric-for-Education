import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    subjectMS: {
        type: String,
        require: true,
    },
    studentMS: {
        type: String,
        required: true,
    },
    teacherMS: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        require: true,
        max: 10,
        min: 0,
    },
    semester: {
        type: Number,
        require: true,
        max: 4,
        min: 0,
    },
    date_awarded: {
        type: String,
        required: true,
        default: new Date().getFullYear().toString(), // Lấy năm hiện tại và chuyển thành chuỗi
        match: /^\d{4}$/, // Sử dụng biểu thức chính quy để đảm bảo chỉ lưu năm (ví dụ: "2022")
    },
    // year: {
    //     type: Date,
    //     require: true,
    // },
});


const Result = mongoose.model("Result", resultSchema);
Result.createIndexes();

export default Result;
