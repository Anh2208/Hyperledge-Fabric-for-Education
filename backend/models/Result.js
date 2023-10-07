import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    subjectId: {
        type: String,
        require: true,
    },
    studentId: {
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
    teacherId: {
        type: String,
        require: true,
    },
    score: {
        type: Number,
        require: true,
        max: 10,
        min: 0,
    },
    // year: {
    //     type: Date,
    //     require: true,
    // },
});

resultSchema.index({"studentId": 1});
resultSchema.index({"teacherId": 1});
resultSchema.index({"subjectId": 1});

const Result = mongoose.model("Reult", resultSchema);
Result.createIndexes();

export default Result;
