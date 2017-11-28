const chalk = require('chalk');
const eslint = require('./eslint');

console.log(
  chalk.hex('#38AC5F')('Starting ESLint')
)
eslint().then(() => {
  console.log(
    chalk.hex('#38AC5F')('ESLint done.')
  )
}).catch(e => {
  console.log(e.message);
  process.exit(-1);
});
