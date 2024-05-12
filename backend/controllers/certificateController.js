const Certificate = require("../models/Certificate");
const Request = require("../models/Request");
const User = require("../models/User");
const {
  uploadFile,
  retrieveShareableLink,
} = require("../utils/googleDriveUtils");

exports.createCertificate = async (req, res) => {
  try {
    const { requestId = "663b988db25ccde7397c3789", name, course } = req.body;
    const pdf = req.file;
    console.log(pdf);
    if (!pdf) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }
    const request = await Request.findOne({ _id: requestId });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    // Upload the PDF file to Google Drive
    if (request.status === "approved") {
      return res
        .status(400)
        .json({ message: "Already certificate generated." });
    }
    if (request.status === "rejected") {
      return res.status(400).json({ message: "Already certificate rejected." });
    }
    const fileId = await uploadFile(pdf);

    // Retrieve the shareable link for the uploaded file
    const certificateUrl = await retrieveShareableLink(fileId);

    // Create a new certificate entry in the database
    const newCertificate = new Certificate({
      requestId,
      name,
      course,
      certificateUrl,
    });
    await newCertificate.save();

    // Update the status of the request
    request.status = "approved";
    request.certificateUrl = certificateUrl;
    await request.save();
    res.status(201).json(newCertificate);
  } catch (error) {
    console.error("Error creating certificate:", error);
    res.status(500).json({ message: "Failed to create certificate" });
  }
};

exports.getCertificatesByRequest = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      requestId: req.params.requestId,
    });
    res.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};
exports.generateNewCertificateWithNewUser = async (req, res) => {
  try {
    const { name, course, email, password, completion_date } = req.body;
    const pdf = req.file;

    console.log(pdf);
    if (!pdf) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    // Check if a user with the provided email already exists
    let user = await User.findOne({ email: email });

    if (!user) {
      // Create a new user if not found
      user = new User({ name, email, password });
      await user.save();
      console.log("New user created:", user);
    }

    // Create a new certificate request
    let newRequest = new Request({
      userId: user._id,
      name,
      course,
      status: "approved",
      completion_date,
    });
    await newRequest.save();
    console.log("New request created:", newRequest);

    pdf.fieldname=`${user._id}_${newRequest._id}`

    // Upload the PDF and retrieve the shareable link
    const fileId = await uploadFile(pdf);
    const certificateUrl = await retrieveShareableLink(fileId);

    // Create a new certificate entry in the database
    const newCertificate = new Certificate({
      requestId: newRequest._id,
      name,
      course,
      certificateUrl,
    });
    await newCertificate.save();
    newRequest.certificateUrl = certificateUrl;
    await newRequest.save();

    res.json(newCertificate);
  } catch (error) {
    console.error("Error processing the certificate generation:", error);
    res
      .status(500)
      .json({ message: "Failed to process certificate generation" });
  }
};

// Update Certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { certificateUrl } = req.body;
    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      { certificateUrl },
      { new: true }
    );
    res.json({ certificate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    await Certificate.findByIdAndDelete(certificateId);
    res.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};