const chalk = require('chalk');

module.exports = ({ label: { text: labelText, color: labelColor }, message }) => {
  console.log(
    chalk.hex(labelColor)(labelText),
    message
  );
};
