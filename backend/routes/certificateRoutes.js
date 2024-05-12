const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage
});
router.post(
  "/",
  upload.single("file"),
  certificateController.createCertificate
);
router.get("/:requestId", certificateController.getCertificatesByRequest);
router.post(
  "/generateNewCertificateWithNewUser",
  upload.single("file"),
  certificateController.generateNewCertificateWithNewUser
);
// Update Certificate
router.put("/:certificateId", certificateController.updateCertificate);

// Delete Certificate
router.delete("/:certificateId", certificateController.deleteCertificate);

module.exports = router;
