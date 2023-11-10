import mongoose from "mongoose";
import validator from "validator";

const verifySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email",
        },
    },
    mssv: {
        type: String,
        require: true,
        minlength: 8,
    },
    class: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: String,
        // required: true,
    },
    sex: {
        type: String,
        require: true,
    },
    state: {
        type: Boolean,
        require: true,
        default: false,
    }
});

let Verify = mongoose.model("Verify", verifySchema);
Verify.createIndexes();

// module.exports = Student;
export default Verify;
