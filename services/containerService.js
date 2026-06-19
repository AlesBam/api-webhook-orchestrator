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

const startContainer = async (containerId) => {
    try {
        const container = docker.getContainer(containerId);
        await container.start();
        return { message: `Container ${containerId} started successfully` };
    } catch (error) {
        if (error.statusCode === 304) {
            return { message: `Container ${containerId} is already running` };
        } 
        else {
            throw error; 
    }}
        
};

const stopContainer = async (containerId) => {
    try {
        const container = docker.getContainer(containerId);
        await container.stop();
        return { message: `Container ${containerId} stopped successfully` };
    } catch (error) {
        if (error.statusCode === 304) {
            return { message: `Container ${containerId} is already stopped` };
        } 
        else {
            throw error;
    }}
};

module.exports = { listAllContainers, getContainerDetails, startContainer, stopContainer };