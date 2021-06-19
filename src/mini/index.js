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

const runSiteLoad = async () => {
    //const url = 'https://www.vlocalshop.in/sitemap.xml';
    const url = await _mini.askUrlToIndex();
    var options = { sitemap: url };
    var mini = new MiNi(options);
    mini.loadsite();
}

const runSiteIndex = async () => {
    const url = 'https://www.vlocalshop.in/sitemap.xml';
    var options = { sitemap: url };
    var mini = new MiNi(options);
    mini.createIndexForSite('vlocalshop');
}

const searchSite = async () => {
    const url = 'https://www.vlocalshop.in/sitemap.xml';
    var options = { sitemap: url, loadIndex: true };
    var mini = new MiNi(options);
    var result = mini.search('apacs ziggler');
    console.log(result);
}

const runTestLoad = async () => {
    var mini = new MiNi();
    let result = await mini.test('./vlocalshop/sample.html');
    console.log(result);
};

const updateImage = async () => {
    var mini = new MiNi();
    await mini.updateFileWithImage('./vlocalshop/v.json');
};

updateImage();