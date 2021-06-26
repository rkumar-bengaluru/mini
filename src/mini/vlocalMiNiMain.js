const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const _mini = require('./miniAsk');
const MiNi = require('./vlocalMini');

clear();

console.log(
    chalk.green(
        figlet.textSync('MINI', { horizontalLayout: 'full' })
    )
);

const startDataPrep = async () => {
    var options = { root: './vlocalshop', loadIndex: false };
    var mini = new MiNi(options);
    mini.startDataPrep();
}

const createSiteIndex = async () => {
    const urltoindex = 'https://www.vlocalshop.in/sitemap.xml';
    var options = { url: urltoindex };
    var mini = new MiNi(options);
    mini.createSiteIndex('vlocalshop');
}

const searchSite = async () => {
    const indexedUrl = 'https://www.vlocalshop.in/sitemap.xml';
    var options = { url: indexedUrl, loadIndex: true };
    var mini = new MiNi(options);
    var result = mini.search('ignite');
    console.log(result);
}


startDataPrep();