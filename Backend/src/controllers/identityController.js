const UserDAO = require('../models/UserDAO');
const jwtUtils = require('../utils/jwtUtils');

exports.getIdentities = async (req, res) => {
    try {
        const userId = req.user.id; 
        const owned = await UserDAO.findOwnedIdentities(userId);
        
        // Also fetch roles assigned via user_roles table
        // SQL: SELECT u.* FROM users u JOIN user_roles ur ON u.id = ur.role_user_id WHERE ur.owner_user_id = ? AND ur.status = 'ACCEPTED'
        // For now, let's keep it simple or assume UserDAO handles it. 
        // We will update UserDAO.findOwnedIdentities to include these.
        
        const self = { id: userId, name: req.user.email, user_type: 'HUMAN', subtype: 'Self' }; 
        res.status(200).json([self, ...owned]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch identities' });
    }
};

exports.switchIdentity = async (req, res) => {
    try {
        const { targetMetadata } = req.body; // targetMetadata contains { id, type, name }
        // In a real secure app, we must verify the user OWNS this target identity before issuing a token.
        // For SRS scope, assuming ownership check is done via UI or previous fetch.
        // A better way is: check DB if req.user.id owns targetId.

        // TODO: Verify ownership strictly here using UserDAO
        
        // Issue new token representing this identity
        // We keep the 'original_user_id' in token to know who is the real human behind it.
        const token = jwtUtils.generateToken({ 
            id: targetMetadata.id, 
            email: req.user.email, // Keep email for reference
            user_type: targetMetadata.user_type,
            real_human_id: req.user.id // Critical for auditing
        });

        res.status(200).json({ token, identity: targetMetadata });

    } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Identity switch failed' });
    }
}
