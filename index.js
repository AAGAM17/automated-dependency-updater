#!/usr/bin/env node

const { program } = require('commander');
const updater = require('./src/updater');

program
  .version('1.0.0')
  .description('Automated Dependency Updater CLI Tool');

program
  .option('-p, --platform <platform>', 'Specify the platform (github, gitlab, bitbucket)', 'github')
  .option('-v, --verbose', 'Enable verbose logging');

program
  .command('run')
  .description('Run the dependency updater')
  .action(() => {
    const options = program.opts();
    updater.runUpdateProcess(options.platform, options.verbose);
  });

program
  .command('schedule <cronExpression>')
  .description('Schedule the updater with a cron expression')
  .action((cronExpression) => {
    const options = program.opts();
    updater.scheduleUpdates(cronExpression, options.platform, options.verbose);
  });

program
  .command('*')
  .action(() => {
    const options = program.opts();
    updater.runUpdateProcess(options.platform, options.verbose);
  });

program.parse(process.argv);