import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  groupMa: {
    type: String,
    required: true,
  },
  groupTen: {
    type: String,
    required: true,
  },
  subjectMa: {
    type: String,
    required: true,
  },
  msgv: {
    type: String,
    // required: true,
    // minlength: 8,
  },
  namegv: {
    type: String,
    // required: true,
    trim: true,
  },
  slot: {
    type: Number,
    required: true,
    min: 0,
  },
  currentslot: {
    type: Number,
    default: 0,
    // required: true,
  },
  semester: {
    type: Number,
    required: true,
    max: 4,
    min: 0,
  },
  access: {
    // thời gian cho phép thay đổi điểm sinh viên
    type: Date,
    required: true,
  },
  year: {
    type: String,
    required: true,
    default: new Date().getFullYear().toString(), // Lấy năm hiện tại và chuyển thành chuỗi
    match: /^\d{4}$/, // Sử dụng biểu thức chính quy để đảm bảo chỉ lưu năm (ví dụ: "2022")
  },
  results: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Result",
    },
  ],
});

const Group = mongoose.model("Group", groupSchema);
Group.createIndexes();

export default Group;
