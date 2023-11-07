import mongoose from "mongoose";

const degreeSchema = new mongoose.Schema(
    {
        university: {
            type: String,
        },
        degreeType: {
            type: String,
            // required: true
        },
        major: {
            type: String,
            // required: true
        },
        studentMS: {
            type: String,
            // required: true
        },
        studentName: {
            type: String,
            // required: true
        },
        studentDate: {
            type: Date,
            // required: true
        },
        score: {
            type: Number,
            // required: true,
        },
        classification: {
            type: String,
            // required: true
        },
        formOfTraining: {
            type: String,
            // required: true
        },
        code: {
            type: String,
            // required: true
        },
        inputbook: {
            type: String,
            // required: true
        },
        image: {
            type: String,
            // required: true
        },
    },
    { timestamps: true }
);

const Degree = mongoose.model("Degree", degreeSchema);

export default Degree;