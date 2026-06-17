const axios = require('axios');
const config = require('../config');


const checkHealth = async (containerName) => {
    try {
        const serviceConfig = config.services[containerName];
        const response = await axios.get(serviceConfig.healthUrl);
        return response.data.status === 'ok' ? { status: 'ok' } : { status: 'unhealthy' };
    } catch (error) {
        console.error(`Health check failed for ${containerName}:`, error.message);
        throw new Error(`Health check failed for ${containerName}`);
    }
};

module.exports = { checkHealth };