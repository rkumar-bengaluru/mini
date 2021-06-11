const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const _mini = require('./miniAsk');
const MiNi = require('./mini');

clear();

console.log(
    chalk.green(
        figlet.textSync('MINI', { horizontalLayout: 'full' })
    )
);

const run = async () => {
    
    const url = await _mini.askUrlToIndex();
    console.log('url to index - ' + JSON.stringify(url));
    var user = new MiNi(url.url);
    user.load();
};

run();