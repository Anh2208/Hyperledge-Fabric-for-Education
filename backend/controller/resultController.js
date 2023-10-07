import Result from "../models/Result.js";

// create result
export const createResult = async (req, res) => {
    // const newResult = new Result(req.body);

    try {
        const saveResult = await Result.create({
            subjectId: req.body.subjectId,
            studentId: req.body.studentId,
            studentMS: req.body.studentMS,
            teacherMS: req.body.teacherMS,
            teacherId: req.body.teacherId,
            score: req.body.score,
        });
        // console.log(saveResult);
        res.status(200).json({ success: true, message: "Create result successfully!!!", data: saveResult });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create result. Try again" });
    }
};

// update result
export const updateResult = async (req, res) => {
    const id = req.params.id;

    try {
        const updateResult = await Result.findByIdAndUpdate(id, { $set: req.body, }, { new: true });

        res.status(200).json({
            success: true,
            message: "Update result successfuly!!!",
            data: updateResult,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "failed to update result",
        });
    }
};

// delete result
export const deleteResult = async (req, res) => {
    const id = req.params.id;

    try {
        await Result.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Successfully deleted result",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "failed to delete result",
        });
    }
};

// get result by studentMS
export const getResultStudent = async (req, res) => {
    const studentMS = new RegExp(req.query.studentMS, "i");
    // const masoStudent = "B1906425";
    // console.log(studentMS);
    try {
        const result = await Result.find({studentMS});
        res.status(200).json({
            success: true,
            message: "Find result by studentMS successfully",
            data: result,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "result of studentMS not found",
        });
    }
};