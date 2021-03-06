const MiNi = require('./lining');
var fs = require('fs');

const runMapping = async() => {
    var src = 'lining/pages/';
    var dest = 'lining/catalog/';
    var mini = new MiNi(src,dest);
    mini.startConverting();
}

const runProbe = async() => {
    var src = 'lining/itr2/';
    var dest = 'lining/catalog/';
    var mini = new MiNi(src,dest);
    mini.probe('lining/itr2/basketball.html');
}

const createSuccessList = async() => {
    var src = 'lining/itr2/';
    var dest = 'lining/catalog/';
    var mini = new MiNi(src,dest);
    var all = await mini.fetchFilesToConvert('lining/catalog/productsv2');
    var allformatted = [];
    all.forEach(function(e) {
        allformatted.push('https://www.vlocalshop.in/product/' + e.split('.')[0]);
    })
    console.log(JSON.stringify(allformatted));
}
const createSiteMap = async() => {
    var src = 'lining/itr1/';
    var dest = 'lining/catalog/';
    var mini = new MiNi(src,dest);
    var all = await mini.fetchFilesToConvert('lining/catalog/productsv2');
    var allformatted = [];
    var sitemap = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><all>';
    all.forEach(function(e) {
        sitemap += '<url>' + '<loc>https://www.vlocalshop.in/product/' + e.split('.')[0] + '</loc></url>'; 
    })
    sitemap += '</all>';
    fs.writeFileSync('lining/catalog/sitemap.xml', sitemap);
}

const convertJPG2Web = async() => {
    var src = 'lining/itr1/';
    var dest = 'lining/catalog/';
    var mini = new MiNi(src,dest);
    mini.convertJPG2Web();
}

const removeAllJPEG = async() => {
    var src = 'lining/itr1/';
    var dest = 'lining/catalog/';
    var mini = new MiNi(src,dest);
    mini.removeAllJPEG();
}

createSiteMap();