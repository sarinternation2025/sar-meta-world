const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const si = require('systeminformation');
const Docker = require('dockerode');
const { checkAlerts } = require('./alerts');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
const docker = new Docker();

io.on('connection', (socket) => {
  console.log('a user connected');

  const sendData = async () => {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const fsSize = await si.fsSize();

    const metrics = {
      cpu: cpu.currentLoad,
      memory: (mem.used / mem.total) * 100,
      disk: fsSize[0].use,
    };

    const containers = await docker.listContainers();
    const services = {};
    containers.forEach(container => {
      services[container.Names[0].substring(1)] = { status: container.State };
    });

    const alerts = checkAlerts(metrics);

    socket.emit('data', { metrics, services, alerts });
  };

  const interval = setInterval(sendData, 1000);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    clearInterval(interval);
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
