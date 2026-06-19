const Express = require('express');
const { listAllContainers, getContainerDetails, startContainer, stopContainer } = require('./services/containerService');
const { checkHealth } = require('./services/healthService');

const app = Express();

app.get('/containers', async (req, res) => {
  try {
    const containers = await listAllContainers();
    res.json(containers);
  } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve container details';
        console.error(error);
        res.status(statusCode).json({ error: message })
    }
});

app.get('/containers/:id', async (req, res) => {
  const containerId = req.params.id;
  try {
    const container = await getContainerDetails(containerId);
    res.json(container);
  } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve container details';
        console.error(error);
        res.status(statusCode).json({ error: message })
    }
}); 

app.post('/containers/:id/start', async (req, res) => {
  const containerId = req.params.id;
  try {
    const result = await startContainer(containerId);
    res.json(result);
  } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve container details';
        console.error(error);
        res.status(statusCode).json({ error: message })
    }
});

app.post('/containers/:id/stop', async (req, res) => {
  const containerId = req.params.id;
  try {
    const result = await stopContainer(containerId);
    res.json(result);
  } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve container details';
        console.error(error);
        res.status(statusCode).json({ error: message })
    }
});

app.get('/health/:service', async (req, res) => {
  const serviceName = req.params.service;
    try {
      const healthStatus = await checkHealth(serviceName);
      res.json(healthStatus);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve container details';
        console.error(error);
        res.status(statusCode).json({ error: message })
    }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});