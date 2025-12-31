const RoleDAO = require('../models/RoleDAO');
const UserDAO = require('../models/UserDAO');

exports.assignRole = async (req, res) => {
    try {
        const { roleId, assigneeId } = req.body;
        // Verify req.user.id owns the role or is admin/hierarchy
        // MVP: Assume check passed
        
        await RoleDAO.assignRole({ roleId, assigneeId });
        res.status(200).json({ message: 'Role assigned, pending acceptance' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
};

exports.respondToRoleAssignment = async (req, res) => {
    try {
        const { roleId, status } = req.body; // ACCEPTED / REJECTED
        const userId = req.user.id;
        
        await RoleDAO.updateAssignmentStatus(roleId, userId, status);
        
        // If Accepted, this user now effectively 'owns' this identity for switching
        // The IdentityController.getIdentities logic should verify this table too.
        
        res.status(200).json({ message: `Role ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to respond' });
    }
};
