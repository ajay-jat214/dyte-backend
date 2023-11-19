const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    resourceId: {
	type: String,
	default:  "",
    },
    parentResourceId: {
	type: String,
	default: "",
    }
});

var logs = mongoose.model("logs", logSchema);
module.exports = logs;
