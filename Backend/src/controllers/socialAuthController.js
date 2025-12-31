const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID token required' });
        }

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        // Check if user exists in auth_identities
        const [existingIdentity] = await pool.execute(
            `SELECT ai.*, u.id as user_id, u.name as user_name, u.user_type, u.score 
             FROM auth_identities ai 
             JOIN users u ON ai.user_id = u.id 
             WHERE ai.provider = 'GOOGLE' AND ai.provider_uid = ?`,
            [googleId]
        );

        let userId, userName, userType, score;

        if (existingIdentity.length > 0) {
            // User exists
            userId = existingIdentity[0].user_id;
            userName = existingIdentity[0].user_name;
            userType = existingIdentity[0].user_type;
            score = existingIdentity[0].score;
        } else {
            // Create new user
            const [userResult] = await pool.execute(
                `INSERT INTO users (user_type, subtype, name, is_active, score) 
                 VALUES ('HUMAN', 'Student', ?, TRUE, 0)`,
                [name]
            );
            userId = userResult.insertId;
            userName = name;
            userType = 'HUMAN';
            score = 0;

            // Create auth identity
            await pool.execute(
                `INSERT INTO auth_identities (user_id, provider, provider_uid, email, is_primary, is_verified) 
                 VALUES (?, 'GOOGLE', ?, ?, TRUE, TRUE)`,
                [userId, googleId, email]
            );
        }

        // Generate JWT
        const token = jwt.sign(
            { id: userId, email, name: userName, type: userType, score },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: { id: userId, email, name: userName, type: userType, score }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
