const ipc = require('node-ipc').default;

const log = require('../../../src/logger');

const state = {
  workers: 0,
  detoxConfig: null,
};

module.exports = {
  async start({ sessionId, detoxConfig }) {
    state.detoxConfig = detoxConfig;

    debugger;
    ipc.config.id = process.env.DETOX_IPC_SERVER_ID = `detox-${sessionId}`;
    ipc.config.retry = 1500;
    ipc.config.sync = true;

    return new Promise((resolve, reject) => {
      ipc.serve(function() {
        resolve();

        ipc.server.on('app.message', function(data, socket) {
          const { type, ...payload } = data;
          switch (type) {
            case 'log': {
              const { level, args } = payload;
              return log[level](args);
            }

            case 'registerWorker': {
              const { workerId } = payload;
              state.workers = Math.max(state.workers, +workerId);
              return ipc.server.emit(socket, 'app.message', {
                type: 'registerWorkerDone',
                detoxConfig: state.detoxConfig,
              });
            }
          }
        });
      });

      ipc.server.start();
    });
  },
};
