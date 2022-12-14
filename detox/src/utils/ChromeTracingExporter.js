const _ = require('lodash');

const DetoxRuntimeError = require('../errors/DetoxRuntimeError');

class ChromeTracingExporter {
  constructor({
    process,
    thread,
  }) {
    this._process = {
      id: process.id,
      name: process.name,
    };
    this._thread = {
      id: thread.id,
      name: thread.name,
    };
  }

  export(traceEvents, append) {
    const _events = _.flatMap(traceEvents, this._parseEvent.bind(this));
    const json = JSON.stringify(_events);
    const prefix = (append ? ',' : '[');
    return `${prefix}${json.slice(1, -1)}`;
  }

  _parseEvent(event) {
    const { name, ts, args, type } = event;
    const tsInMicroseconds = ts * 1000;
    switch (type) {
      case 'start': return this._event(name, 'B', tsInMicroseconds, args);
      case 'end': return this._event(name, 'E', tsInMicroseconds, args);
      case 'init': return [
          this._event('process_name', 'M', tsInMicroseconds, { name: this._process.name }),
          this._event('thread_name', 'M', tsInMicroseconds, { name: this._thread.name }),
        ];
      default:
        throw new DetoxRuntimeError({ message: `Invalid type '${type}' in event: ${event}` });
    }
  }

  _event(name, phase, ts, args) {
    return {
      name,
      pid: this._process.id,
      tid: this._thread.id,
      ts,
      ph: phase,
      args: { ...args },
    };
  }
}

module.exports = ChromeTracingExporter;
