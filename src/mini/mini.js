var logger = require('./logger/logger');
const fetch = require('node-fetch');
const Sitemapper = require('sitemapper');
var fs = require('fs');

class MiNi {
    constructor(_sitemap) {
        this.sitemap = _sitemap;
    }

    loadpage() {
        fetch('https://www.vlocalshop.in/product/Y0C38CGPRA')
            .then(res => res.text())
            .then(body => {
                fs.writeFileSync("programming.txt", data);
                fs.writeFile('vlocalshop/' + 'Y0C38CGPRA.html', body, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            });
    }

    load() {
        logger.debug('MiNi::load::url to load ' + this.sitemap);
        const sitemap = new Sitemapper();
        sitemap.fetch(this.sitemap + '/sitemap.xml').then(function (sites) {
            var url = sites.url;
            var site = url.split('/')[2];
            var siteFolder = site.split('.')[1];
            logger.debug('siteFolder=' + siteFolder);
            if (!fs.existsSync(siteFolder)) {
                fs.mkdirSync(siteFolder);
                logger.debug('MiNi::load:: site folder created ' + siteFolder);
            }

            var allpages = sites.sites;
            allpages.forEach(page => {
                var opage = page;
                var pageName = siteFolder + '/' + opage.split('/')[4] + ".html";
                logger.debug('site page ' + pageName);
                fetch(page)
                    .then(res => res.text()).then(body => {
                        fs.writeFileSync(pageName, body);
                    });

            });
        });
    }
}

module.exports = MiNi;