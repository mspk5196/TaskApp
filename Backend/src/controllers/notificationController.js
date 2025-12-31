const NotificationDAO = require('../models/NotificationDAO');

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await NotificationDAO.findByUser(userId);
        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.body;
        await NotificationDAO.markAsRead(id);
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
