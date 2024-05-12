const Request = require("../models/Request");

exports.createRequest = async (req, res) => {
  try {
    const { userId, name, course } = req.body;
    const newRequest = new Request({ userId, name, course });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.userId });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({}).populate(
      "userId",
      "name email -_id"
    );
    console.log(requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Failed to retrieve requests:", error);
    res.status(500).json({ message: "Failed to retrieve requests" });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await Request.findByIdAndDelete(requestId);
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
