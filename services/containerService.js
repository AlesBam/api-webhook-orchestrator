const Docker = require('dockerode');

const docker = new Docker();

const listAllContainers = async () => {
  const containers = await docker.listContainers({ all: true });
  return containers;
};

const getContainerDetails = async (containerId) => {
  const container = docker.getContainer(containerId);
  const details = await container.inspect();
  return {
    id: details.Id,
    name: details.Name,
    image: details.Image,
    state: details.State.Status,
    created: details.Created,
  };
};

module.exports = { listAllContainers, getContainerDetails };