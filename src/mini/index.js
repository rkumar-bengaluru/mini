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
    //const url = await _mini.askUrlToIndex();
    const url = 'https://prokicksports.com/sitemap_products_1.xml?from=3007608946769&to=6585087262801';
    //console.log('url to index - ' + JSON.stringify(url));
    var mini = new MiNi(url);
    mini.load();
};

run();