const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    professor: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    student: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default: null
    },
    startTime: {
        type:Date,
        required: true
    },
    endTime: {
        type:Date,
        required: true
    },
    status: {
        type:String,
        enum:['available','booked','cancelled'],
        default:'available'
    }
},
{ 
    timestamps: true 
});

module.exports = mongoose.model('Appointment', appointmentSchema);