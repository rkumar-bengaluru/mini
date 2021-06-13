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
    const url = 'https://www.vlocalshop.in/sitemap.xml';
    //console.log('url to index - ' + JSON.stringify(url));
    //var mini = new MiNi(url);
    //mini.createLunrIndex('vlocalshop/vlocalshop.json','vlocalshop');
    var mini = new MiNi();
    let result = mini.search("everlast");
    console.log(result);
};

run();