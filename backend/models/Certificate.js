const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
  },
  date: { type: Date, default: Date.now },
  certificateUrl: { type: String },
});

module.exports = mongoose.model("Certificate", certificateSchema);
