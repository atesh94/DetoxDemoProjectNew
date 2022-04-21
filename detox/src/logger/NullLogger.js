class NullLogger {
  constructor(config) {
    this._config = config;
  }

  child(overrides) {
    return new NullLogger(
      { ...this._config, ...overrides },
    );
  }

  error() {
    // no-op
  }

  warn() {
    // no-op
  }

  info() {
    // no-op
  }

  debug() {
    // no-op
  }

  trace() {
    // no-op
  }

  get level() {
    return this._config.level; // ?
  }
}

module.exports = NullLogger;
