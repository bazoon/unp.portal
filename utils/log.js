const chalk = require('chalk');

const warn = function (s) {
  console.log(chalk.yellow(s));
}

const error = function (s) {
  console.log(chalk.red(s));
}

const log = function (s) {
  console.log(chalk.green(s));
}

module.exports = {
  warn,
  error,
  log
};