const Express = require('express');
const { listAllContainers, getContainerDetails, startContainer, stopContainer } = require('./services/containerService');
const { checkHealth } = require('./services/healthService');

const app = Express();

app.get('/containers', async (req, res) => {
  try {
    const containers = await listAllContainers();
    res.json(containers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve containers' });
  }
});

app.get('/containers/:id', async (req, res) => {
  const containerId = req.params.id;
  try {
    const container = await getContainerDetails(containerId);
    res.json(container);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve container details' });
  }
});

app.post('/containers/:id/start', async (req, res) => {
  const containerId = req.params.id;
  try {
    const result = await startContainer(containerId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start container' });
  }
});

app.post('/containers/:id/stop', async (req, res) => {
  const containerId = req.params.id;
  try {
    const result = await stopContainer(containerId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to stop container' });
  }
});

app.get('/health/:service', async (req, res) => {
  const serviceName = req.params.service;
    try {
      const healthStatus = await checkHealth(serviceName);
      res.json(healthStatus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve health status' });
    }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});