import Result from "../models/Result.js";
import Group from "../models/Group.js";
// create group
export const createGroup = async (req, res) => {
    const newGroup = new Group(req.body);

    try{

        const saveGroup = await newGroup.save();
        // const saveGroup = await newGroup.save();
        res.status(200).json({
            success: true,
            message: "Successfully created Group",
            data: saveGroup,
          });
    }catch(error){
        res.status(500).json({ success: false, message: "Failed to create Group. Try again" });
    }
}

// delete Group
export const deleteGroup = async (req, res) => {
    const id = req.params.id;
    try {
        // get all result of group
        const group = await Group.findById(id).populate("results");
        const results = group.results;
        // get results haven't score
        const emptyScoreResults = results.filter(result => result.score == null);
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
}

// update Group
export const updateGroup = async (req, res) => {
    const id = req.params.id;

    try {
        const updateGroup = await Group.findByIdAndUpdate(id, { $set: req.body, }, { new: true });

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
}

export const getGroup = async (req, res) => {
    const groupID = req.body.id

    try{

        const group = await Group.findById(groupID).populate("results");

        // const tour = await Tour.findById(id).populate("reviews");

        res.status(200).json({success: true, message: "Find Group Successfully!!!", data: group});

    }catch(err){
        res.status(500).json({success: false, message: "False getGroup"})
    }

}