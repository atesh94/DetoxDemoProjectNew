// @ts-nocheck
const { URL } = require('url');
const util = require('util');

const _ = require('lodash');

const configuration = require('../../../src/configuration');
const DeviceRegistry = require('../../../src/devices/DeviceRegistry');
const GenyDeviceRegistryFactory = require('../../../src/devices/allocation/drivers/android/genycloud/GenyDeviceRegistryFactory');
const ipcServer = require('../ipc/server');
const DetoxServer = require('../../../src/server/DetoxServer');
const logger = require('../../../src/utils/logger');
const log = logger.child({ __filename });

class DetoxRootContext {
  constructor(config) {
    this._deviceConfig = config.deviceConfig;
    this._sessionConfig = config.sessionConfig;
    this._cliConfig = config.cliConfig;

    this._wss = null;

    this.setup = this.setup.bind(this);
    this.teardown = this.teardown.bind(this);
  }

  async setup({ argv }) {
    const detoxConfig = await configuration.composeDetoxConfig({ argv });
    await ipcServer.start({
      sessionId: `detox-${process.pid}`,
      detoxConfig,
    });

    try {
      await this._doSetup(detoxConfig);
    } catch (e) {
      await this.teardown();
      throw e;
    }
  }

  async teardown() {
    if (this._wss) {
      await this._wss.close();
      this._wss = null;
    }
  }

  async _doSetup(config) {
    log.trace(
      { event: 'DETOX_CONFIG', config },
      'creating Detox server with config:\n%s',
      util.inspect(_.omit(config, ['errorComposer']), {
        getters: false,
        depth: Infinity,
        maxArrayLength: Infinity,
        maxStringLength: Infinity,
        breakLength: false,
        compact: false,
      })
    );


    if (!this._cliConfig.keepLockFile) {
      await this._resetLockFile();
    }

    const sessionConfig = this._sessionConfig;

    this._wss = new DetoxServer({
      port: sessionConfig.server
        ? new URL(sessionConfig.server).port
        : 0,
      standalone: false,
    });

    await this._wss.open();

    if (!sessionConfig.server) {
      sessionConfig.server = `ws://localhost:${this._wss.port}`;
    }

    // TODO: think if we need it to be encapsulated
    process.env.DETOX_WSS_ADDRESS = sessionConfig.server;
  }

  async _resetLockFile() {
    const deviceType = this._deviceConfig.type;

    switch (deviceType) {
      case 'ios.none':
      case 'ios.simulator':
        await DeviceRegistry.forIOS().reset();
        break;
      case 'android.attached':
      case 'android.emulator':
      case 'android.genycloud':
        await DeviceRegistry.forAndroid().reset();
        break;
    }

    if (deviceType === 'android.genycloud') {
      await GenyDeviceRegistryFactory.forGlobalShutdown().reset();
    }
  }
}

module.exports = DetoxRootContext;
