const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/appointment');

router.get('/appointments/available', auth, async (req, res) => {
    try {
        console.log('Searching with professorId:', req.query.professorId);
        
        const appointments = await Appointment.find({
            professor: req.query.professorId,
            status: 'available'
        });

        console.log('Found appointments:', appointments);
        res.json(appointments);
    }
    catch (error) {
        console.error('Error finding appointments:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/appointments/:id/book', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            status: 'available'
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or already booked' });
        }

        appointment.student = req.user.userId;
        appointment.status = 'booked';
        await appointment.save();

        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/appointments/my', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const appointments = await Appointment.find({
            student: req.user.userId,
            status: 'booked'
        }).populate('professor', 'name email');

        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;