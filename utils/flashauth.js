const AfricasTalking = require('africastalking');

class FlashCallAuth {
    constructor(username, apiKey) {
        this.africasTalking = AfricasTalking({
            username: username,
            apiKey: apiKey
        });
        this.voice = this.africasTalking.VOICE;
        this.pendingVerifications = new Map(); // Store pending verifications
    }

    /**
     * Generate a random verification code
     * @param {number} length - Length of the code (typically 4-6 digits)
     * @returns {string} Generated code
     */
    generateVerificationCode(length = 4) {
        return Math.floor(Math.random() * Math.pow(10, length))
            .toString()
            .padStart(length, '0');
    }

    /**
     * Initiate flash call verification
     * @param {string} phoneNumber - User's phone number (with country code)
     * @param {string} callerId - Your Africa's Talking phone number
     * @returns {Promise<Object>} Verification session details
     */
    async initiateFlashCall(phoneNumber, callerId) {
        try {
            // Generate verification code
            const verificationCode = this.generateVerificationCode(4);
            
            // Create caller ID that ends with the verification code
            // Remove last 4 digits from caller ID and append verification code
            const baseCallerId = callerId.slice(0, -4);
            const flashCallerId = baseCallerId + verificationCode;
            console.log("baseCallerId: ", baseCallerId)
            console.log("flashCallerId: ", flashCallerId)
            
            // Store verification session
            const sessionId = this.generateSessionId();
            this.pendingVerifications.set(sessionId, {
                phoneNumber: phoneNumber,
                verificationCode: verificationCode,
                timestamp: Date.now(),
                verified: false
            });

            // Make the flash call
            const options = {
                callTo: phoneNumber,
                callFrom: callerId
            };

            // Use Africa's Talking Voice API to make a call
            // The call will be automatically disconnected after 1-2 rings
            console.log('Making call with options:', options);
            const response = await this.voice.call(options);
            console.log('Flash call initiated:', response);
            
            return {
                sessionId: sessionId,
                verificationCode: verificationCode, // For testing - remove in production
                status: 'initiated',
                expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes expiry
            };

        } catch (error) {
            console.error('Flash call failed:', error);
            throw new Error('Failed to initiate flash call verification');
        }

    }

    /**
     * Verify the flash call by checking if user received the call
     * @param {string} sessionId - Verification session ID
     * @param {string} userEnteredCode - Code user claims to have received
     * @returns {Promise<Object>} Verification result
     */
    async verifyFlashCall(sessionId, userEnteredCode) {
        const verification = this.pendingVerifications.get(sessionId);
        
        if (!verification) {
            return {
                success: false,
                error: 'Invalid or expired verification session'
            };
        }

        // Check if verification has expired (5 minutes)
        if (Date.now() - verification.timestamp > 5 * 60 * 1000) {
            this.pendingVerifications.delete(sessionId);
            return {
                success: false,
                error: 'Verification session expired'
            };
        }

        // Verify the code
        if (verification.verificationCode === userEnteredCode) {
            verification.verified = true;
            this.pendingVerifications.delete(sessionId);
            
            return {
                success: true,
                phoneNumber: verification.phoneNumber,
                message: 'Phone number verified successfully'
            };
        } else {
            return {
                success: false,
                error: 'Invalid verification code'
            };
        }
    }

    /**
     * Alternative: Automatic verification using call logs (Android only)
     * This would require additional permissions and SDK integration
     */
    async automaticVerification(sessionId, callerIdReceived) {
        const verification = this.pendingVerifications.get(sessionId);
        
        if (!verification) {
            return { success: false, error: 'Invalid session' };
        }

        // Extract last 4 digits from caller ID
        const receivedCode = callerIdReceived.slice(-4);
        
        if (receivedCode === verification.verificationCode) {
            verification.verified = true;
            this.pendingVerifications.delete(sessionId);
            
            return {
                success: true,
                phoneNumber: verification.phoneNumber,
                message: 'Automatic verification successful'
            };
        }

        return { success: false, error: 'Verification failed' };
    }

    /**
     * Clean up expired verifications
     */
    cleanupExpiredVerifications() {
        const now = Date.now();
        for (const [sessionId, verification] of this.pendingVerifications) {
            if (now - verification.timestamp > 5 * 60 * 1000) {
                this.pendingVerifications.delete(sessionId);
            }
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
}

module.exports = FlashCallAuth;