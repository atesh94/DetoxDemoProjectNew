// TODO Tweak such that if apk's already exist on the device (need to store uniquely), they will not be resent (would optimize cloud, for example)

class AppInstallHelper {
  constructor(adb, tempFileTransfer) {
    this._adb = adb;
    this._tempFileTransfer = tempFileTransfer;
  }

  async install(deviceId, appBinaryPath, testBinaryPath) {
    await this._tempFileTransfer.prepareDestinationDir(deviceId);
    await this._pushAndInstallBinary(deviceId, appBinaryPath, 'Application.apk');
    if (testBinaryPath) {
      await this._pushAndInstallBinary(deviceId, testBinaryPath, 'Test.apk');
    }
  }

  async _pushAndInstallBinary(deviceId, binaryPath, binaryFilenameOnTarget) {
    const binaryPathOnTarget = await this._tempFileTransfer.send(deviceId, binaryPath, binaryFilenameOnTarget);
    await this._adb.remoteInstall(deviceId, binaryPathOnTarget);
  }
}

module.exports = AppInstallHelper;
