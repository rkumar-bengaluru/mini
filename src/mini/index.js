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
    const options = await _mini.askUrlToIndex();
    var mini = new MiNi(options);
    mini.loadsite();
}

const runSiteIndex = async () => {
    const urltoindex = 'https://www.vlocalshop.in/sitemap.xml';
    var options = { url: urltoindex };
    var mini = new MiNi(options);
    mini.createIndexForSite('vlocalshop');
}

const searchSite = async () => {
    const indexedUrl = 'https://www.vlocalshop.in/sitemap.xml';
    var options = { url: indexedUrl, loadIndex: true };
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

searchSite();