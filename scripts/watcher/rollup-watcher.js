const rollup = require('rollup');
const EventEmitter = require('event-emitter');

class WatchEmitter extends EventEmitter {};


module.exports = options => {
  const _watcher = rollup.watch(options);
  const watchEmitter = new WatchEmitter();
  _watcher.on('event', event => {
    watchEmitter.emit(event.code, event);
  });

  // stop watching
  // watcher.close();

  return watchEmitter;
};

// event.code can be one of:
//   START        — the watcher is (re)starting
//   BUNDLE_START — building an individual bundle
//   BUNDLE_END   — finished building a bundle
//   END          — finished building all bundles
//   ERROR        — encountered an error while bundling
//   FATAL        — encountered an unrecoverable error
module.exports.events = {
  START: 'START',
  BUNDLE_START: 'BUNDLE_START',
  BUNDLE_END: 'BUNDLE_END',
  END: 'END',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};
