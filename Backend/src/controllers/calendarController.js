const CalendarSlotDAO = require('../models/CalendarSlotDAO');

exports.getDailySlots = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query; // YYYY-MM-DD

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const slots = await CalendarSlotDAO.getSlotsForDay(userId, date);
        res.status(200).json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch calendar slots' });
    }
};
