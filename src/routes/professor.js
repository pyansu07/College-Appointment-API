const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/appointment');

router.post('/availability', auth, async (req, res) => {
    try {
        if(req.user.role !== 'professor'){
            return res.status(403).json({ message: 'Only professors can create availability' });
        }

        const appointment = new Appointment({
            professor: req.user.userId,
            startTime: new Date(req.body.startTime),
            endTime: new Date(req.body.endTime),
            status: 'available'
        });

        await appointment.save();
        res.status(201).json(appointment);
    }
    catch (error) {
        console.error('Error creating availability:', error);
        res.status(500).json({ message: error.message });
    }
});

router.put('/appointments/:id/cancel', auth, async (req, res) => {
    try {
        if(req.user.role !== 'professor'){
            return res.status(403).json({ message: 'Access denied' });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, professor: req.user.userId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;