const Express = require('express');
const { listAllContainers, getContainerDetails } = require('./services/containerService');

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

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});