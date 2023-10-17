import Student from "../models/Student.js";

//create new student
export const createStudent = async (req, res) => {
  // try {
  //     let keys = await fabricEnrollment.registerUser(req.body.email);

  //     let dbResponse = await students.create({
  //         name : req.body.name,
  //         email: req.body.email,
  //         password: req.body.password,
  //         publicKey: keys.publicKey
  //     });

  //     res.render("register-success", { title, root,
  //         logInType: req.session.user_type || "none"});
  // }
  // catch (e) {
  //     logger.error(e);
  //     next(e);
  // }

  try {
    // let keys = await fabricEnrollment.registerUser(req.body.email);

    let saveStudent = await Student.create({
      name: req.body.name,
      email: req.body.email,
      mssv: req.body.mssv,
      password: req.body.password,
    });
    // dateofbirth: req.body.dateofbirth,
    // publicKey: keys.publicKey

    res
      .status(200)
      .json({
        success: true,
        message: "Create student successfully!!!",
        data: saveStudent,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create student. Try again" });
  }
};
