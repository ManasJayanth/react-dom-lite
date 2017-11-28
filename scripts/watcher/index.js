const plugins = require('../rollup/plugins');
const external = require('../rollup/external');
const { entry, dest } = require('../rollup/files');
const RollupWatcher = require('./rollup-watcher');
const log = require('./log');

const inputOptions = {
  input: entry,
  plugins,
  external
};
const outputOptions = {
  file: dest,
  format: 'cjs'
};

log('Watching...');

const watcher = RollupWatcher(
  Object.assign(
    {},
    inputOptions,
    { output: outputOptions }
  )
);

watcher.on(RollupWatcher.events.START, () => {
  log('Watch triggered');
});

// watcher.on(RollupWatcher.events.BUNDLE_START, () => {
// });

watcher.on(RollupWatcher.events.BUNDLE_END, () => {
  log(`Bundled ${outputOptions.file}`);
});

watcher.on(RollupWatcher.events.END, () => {
});

watcher.on(RollupWatcher.events.ERROR, event => {
  log(`Error: ${event.error.message}`);
});

watcher.on(RollupWatcher.events.FATAL, event => {
  log(`Fatal Error: ${event.error.message}`);
});
