const logger = require('../utils/logger');

module.exports = message => {
  logger({
    label: { color: '#38AC5F' , text: 'Rollup' },
    message
  });
};
