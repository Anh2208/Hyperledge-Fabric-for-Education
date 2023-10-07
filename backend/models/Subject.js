import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectMa: {
        type: String,
        require: true,
    },
    subjectTen: {
        type: String,
        require: true,
    },
    subjectSotc: {
        type: String,
        require: true,
    }
});

subjectSchema.index({'subjectMa': 1});

const Subject = mongoose.model("Subject", subjectSchema);
Subject.createIndexes();

export default Subject;
