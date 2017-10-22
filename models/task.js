// Load required packages
var mongoose = require('mongoose');
var Task = require('../models/task');


// Define our task schema
var TaskSchema = new mongoose.Schema({
    name: {type: String, required: true },
    description: {type: String, default: ''},
    deadline: {type: Date, required: true },
    completed: {type: Boolean, default: Boolean(false)},
    assignedUser: {type: String, default: ''},
    assignedUserName: {type: String, default: 'unassigned'},
    dateCreated: {type: Date, default: Date.now}
}, {
    versionKey: false
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);
