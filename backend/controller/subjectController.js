import Subject from "../models/Subject.js";

// create subject
export const createSubject = async (req, res) => {
  const subjectMa = req.body.subjectMa;

  try {
    // Kiểm tra xem mã học phần đã tồn tại hay chưa
    const existingSubject = await Subject.findOne({ subjectMa });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Mã học phần đã tồn tại trong hệ thống.",
      });
    }
    const saveSubject = await Subject.create({
      subjectMa: req.body.subjectMa,
      subjectTen: req.body.subjectTen,
      subjectSotc: req.body.subjectSotc,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Create subject successfully!!!",
        data: saveSubject,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create Subject. Please try again",
      });
  }
};

//update subject
export const updateSubject = async (req, res) => {
  const id = req.params.id;

  try {
    const updateSubject = await Subject.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated subject",
      data: updateSubject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to update subject",
    });
  }
};

//delete subject
export const deleteSubject = async (req, res) => {
  const id = req.params.id;
  try {
    await Subject.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Successfully deleted subject",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to delete subject",
    });
  }
};

//get single subject
export const getSingleSubject = async (req, res) => {
  const id = req.params.id;

  try {
    const subject = await Subject.findById(id);
    res.status(200).json({
      success: true,
      message: "Find subject successfully",
      data: subject,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Single subject not found",
    });
  }
};

// get subject by Ma
export const getSubjectByMS = async (req, res) => {
  const subjectMa = req.query.subjectMa;
  // const subjectMa = "CT001";
  console.log("subject ma is: ", subjectMa);
  try {
    const subject = await Subject.findOne({ subjectMa });
    res.status(200).json({
      success: true,
      message: "Find subject by Ma successfully",
      data: subject,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "subject of Ma not found",
    });
  }
};

//get all subject
export const getAllSubject = async (req, res) => {
  const subject = await Subject.find({});

  try {
    res.status(200).json({
      success: true,
      message: "Find all subject successfully",
      data: subject,
    });
    //or
    // res.json({
    //     subject,
    // });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "All subject can't found",
    });
  }
};
