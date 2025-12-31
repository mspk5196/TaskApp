const ClosureDAO = require('../models/ClosureDAO');
const PenaltyDAO = require('../models/PenaltyDAO');

exports.generateOTP = async (req, res) => {
    try {
        const { taskId } = req.body;
        const userId = req.user.id;

        const otp = await ClosureDAO.generateOTP(taskId, userId);
        res.status(200).json({ otp, message: 'OTP generated. Valid for 10 minutes.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { taskId, otp } = req.body;
        const userId = req.user.id;

        const isValid = await ClosureDAO.verifyOTP(taskId, userId, otp);
        
        if (isValid) {
            res.status(200).json({ message: 'OTP verified. Task can be closed.' });
        } else {
            res.status(400).json({ error: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        const { taskId, photoUrl } = req.body;
        const userId = req.user.id;

        await ClosureDAO.storePhotoProof(taskId, userId, photoUrl);
        res.status(200).json({ message: 'Photo uploaded. Awaiting verification.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
};

exports.getPenalties = async (req, res) => {
    try {
        const userId = req.user.id;
        const penalties = await PenaltyDAO.getUserPenalties(userId);
        res.status(200).json(penalties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch penalties' });
    }
};

exports.runPenaltyCalculation = async (req, res) => {
    try {
        const count = await PenaltyDAO.calculatePenalties();
        res.status(200).json({ message: `Processed ${count} overdue tasks` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate penalties' });
    }
};
