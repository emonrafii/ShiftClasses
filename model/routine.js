const mongoose = require('mongoose');

const routineSchema = mongoose.Schema({
    day: String,
    slot: String,
    room: Number,
    course_code: String,
    course_title: String,
    status: {
        type: String,
        enum: ['available', 'pending', 'approved'],
        default: 'available'
    }
})
module.exports = mongoose.model('routine', routineSchema);