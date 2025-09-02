const FlashCallAuth = require('./utils/flashauth')

// Express.js API Implementation Example
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
require('dotenv').config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

const flashAuth = new FlashCallAuth(process.env.USERNAME, process.env.API_KEY);

const credentials = {
    apiKey: process.env.API_KEY,
    username: process.env.USERNAME,
}

// Initialize the SDK
const AfricasTalking = require('africastalking')(credentials);

// Get the voice service
const voice = AfricasTalking.VOICE;

// Endpoint to initiate flash call
app.post('/api/flash-call/initiate', async (req, res) => {
    try {
        const { phoneNumber, callerId } = req.body;
        
        const verification = await flashAuth.initiateFlashCall(phoneNumber, callerId);
        
        res.json({
            sessionId: verification.sessionId,
            status: 'initiated',
            verificationCode: verification.verificationCode,
            expiresAt: verification.expiresAt
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Endpoint to verify flash call
app.post('/api/flash-call/verify', async (req, res) => {
    try {
        const { sessionId, code } = req.body;
        
        const result = await flashAuth.verifyFlashCall(sessionId, code);
        
        if (result.success) {
            res.json({
                success: true,
                phoneNumber: result.phoneNumber,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clean up expired verifications every 10 minutes
setInterval(() => {
    flashAuth.cleanupExpiredVerifications();
}, 10 * 60 * 1000);

app.listen(process.env.PORT, () => {
    console.log(`Flash call authentication server running on port '${ process.env.PORT }`);
});

