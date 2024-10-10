import crypto from 'crypto';

const generateApiKey = () => {
    const apiKey = crypto.randomBytes(32).toString('hex');
    return apiKey;
}

export {generateApiKey};