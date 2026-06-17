module.exports = {
  services: {
    apiGateway: {
      healthUrl: 'http://localhost:3000/api/health',
      containerName: 'api-gateway',
    },
    webhookService: {
      healthUrl: 'http://localhost:8000/webhook/health',
      containerName: 'webhook-service',
    },
  }
};