const configuration = require('../../../src/configuration');
const ipcServer = require('../ipc/server');

const DetoxGlobalContext = require('./DetoxGlobalContext');

module.exports = new DetoxGlobalContext();

// TODO: move this to... you know where
async function TODO__globalSetup(override) {

  try {
    await this._doSetup(override);
  } catch (e) {
    try {
      await this.teardown();
      throw e; // TODO: check if global teardown is called on failure? if yes, cleanup() there instead
    } finally {
      delete global['detox'];
    }
  }
}
