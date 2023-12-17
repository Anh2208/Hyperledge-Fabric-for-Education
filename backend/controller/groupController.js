import Result from "../models/Result.js";
import Group from "../models/Group.js";
import Subject from "../models/Subject.js";
import Teacher from "../models/Teacher.js"
import { getResultByMSSV } from "./resultController.js";
// create group
export const createGroup = async (req, res) => {
  const newGroup = new Group(req.body);

  try {

    const groupMa = await Group.find({ groupMa: newGroup.groupMa });
    const subjectMa = await Subject.find({ subjectMa: newGroup.subjectMa });
    const msgv = await Teacher.findOne({ msgv: newGroup.msgv });

    if (groupMa.length > 0) {
      res.status(400).json({ success: false, message: "Lớp học đã tồn tại" });
      return;
    } else if (subjectMa.length === 0) {
      res.status(400).json({ success: false, message: "Học phần không tồn tại" });
      return;
    } else if (msgv != null) {
      if (msgv.length === 0) {
        res.status(400).json({ success: false, message: "Giảng viên không tồn tại" });
        return;
      }
    }
    const saveGroup = await newGroup.save();
    // console.log("name teacher is ",msgv);
    if (msgv != null) {
      await Group.findByIdAndUpdate(saveGroup._id, {
        namegv: msgv.name
      })
    }
    // const saveGroup = await newGroup.save();
    res.status(200).json({
      success: true,
      message: "Successfully created Group",
      data: saveGroup,
    });
  } catch (error) {
    console.log("ERROR", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi tạo lớp học phần" });
  }
};

// delete Group
export const deleteGroup = async (req, res) => {
  const id = req.params.id;
  try {
    // get all result of group
    const group = await Group.findById(id).populate("results");
    const results = group.results;
    // get results haven't score
    const emptyScoreResults = results.filter((result) => result.score == null);
    // remove result haven't score
    for (const emptyScoreResult of emptyScoreResults) {
      await Result.findByIdAndDelete(emptyScoreResult._id);
    }
    //delete Group
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Successfully deleted group",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to delete group",
    });
  }
};

// update Group
export const updateGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const updateGroup = await Group.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );
    const teacher = await Teacher.findOne({ msgv: req.body.msgv });
    if (req.body.msgv === "") {
      await Group.findByIdAndUpdate(id, {
        namegv: "",
        msgv: ""
      })
    } else if (req.body.msgv != "" && !teacher) {
      await Group.findByIdAndUpdate(id, {
        namegv: "",
        msgv: ""
      })
      res.status(400).json({ success: false, message: "Giảng viên không tồn tại" });
      return;
    } else {
      await Group.findByIdAndUpdate(id, {
        namegv: teacher.name
      })
    }
    res.status(200).json({
      success: true,
      message: "Successfully updated group",
      data: updateGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to update group",
    });
  }
};

export const getGroupbyID = async (req, res) => {
  const groupID = req.params.id;

  try {
    const group = await Group.findById(groupID).populate("results");

    // const tour = await Tour.findById(id).populate("reviews");

    res
      .status(200)
      .json({
        success: true,
        message: "Find Group Successfully!!!",
        data: group,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: "False getGroup" });
  }
};

export const getGroupbyMSGV = async (req, res) => {
  const msgv = req.body.msgv;

  try {
    // const group = await Group.findById(groupID).populate("results");
    const group = await Group.find({ msgv: msgv }).populate("results");

    // const tour = await Tour.findById(id).populate("reviews");

    res
      .status(200)
      .json({
        success: true,
        message: "Find Group Successfully!!!",
        data: group,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: "False getGroup" });
  }
};

//get all group
export const getAllGroup = async (req, res) => {
  const group = await Group.find({}).populate("results");

  try {
    res
      .status(200)
      .json({ success: true, message: "List all group", data: group });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to find all group. Please try again",
      });
  }
};