const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

router.post("/", requestController.createRequest);
router.get("/:userId", requestController.getRequestsByUser);
router.get("/", requestController.getAllRequests);
router.delete("/:requestId", requestController.deleteRequest);
module.exports = router;
