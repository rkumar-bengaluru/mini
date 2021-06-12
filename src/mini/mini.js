var logger = require('./logger/logger');
const fetch = require('node-fetch');
const Sitemapper = require('sitemapper');
var fs = require('fs');
const path = require('path');

class MiNi {

    constructor(_sitemap) {
        this.sitemap = _sitemap;
        this.sitemapspl = this.sitemap.split('/');
        this.siteName = this.sitemapspl[2];
        this.homepage = this.sitemapspl[0] + '/' + this.sitemapspl[1] + '/' + this.sitemapspl[2];
        var tmp = this.siteName.split('.');
        if (tmp.length == 2)
            this.siteFolder = tmp[0]
        else if (tmp.length == 3)
            this.siteFolder = tmp[1]
        else
            throw new Error('invalid url');
        this.sitemapFileName = this.siteFolder + '/' + 'sitemap.json'
        this.allpages = [];
        this.curPageIndex = -1;
        this.politePolicyInterval = 5000;// 5 seconds interval to load pages.
    }

    get folder() {
        return this.siteFolder;
    }

    get home() {
        return this.homepage;
    }

    createSiteFolder() {
        try {
            if (!fs.existsSync(this.folder)) {
                fs.mkdirSync(this.folder);
                logger.debug('MiNi::load:: site folder created ' + this.folder);
            }
        } catch (e) {
            throw e;
        }
    }

    fetchSiteMap() {
        var allpages = [];
        var temp = this.sitemapFileName;
        return new Promise((resolve, reject) => {
            var sitemap = new Sitemapper({
                url: this.sitemap,
                timeout: 15000 //15 seconds
            });
            sitemap.fetch().then(function (sites) {
                var pages = sites.sites;
                logger.debug('no of pages =' + pages.length);
                pages.forEach(page => {
                    allpages.push(page);
                });
                fs.writeFileSync(temp, JSON.stringify(allpages));
                logger.debug('sitemap written to local fs ' + temp);
                resolve(allpages);
            }).catch(function (error) {
                reject(error.message)
            });
        })
    }

    fetchPage(page) {
        return new Promise((resolve, reject) => {
            var pageName = this.folder + '/';
            if (page === this.homepage || (page === this.homepage + '/')) {
                pageName += this.folder;
            } else {
                var tmp = page.split('/');
                pageName += tmp[tmp.length - 1];
            }
            pageName += ".html"
            logger.debug('loading page...' + pageName);
            fetch(page).then(res => res.text()).then(body => {
                fs.writeFileSync(pageName, body);
            });
            resolve(pageName);
        });
    }

    advancePageFetch = async () => {
        ++this.curPageIndex;
        if (this.curPageIndex >= this.allpages.length) {
            this.curPageIndex = 0;
        }
        let pagedownloaded = await this.fetchPage(this.allpages[this.curPageIndex]);   // set new news item into the ticker
        logger.debug('page load over...' + pagedownloaded);
    }

    startIndexing = async () => {
        logger.debug('fetching sitemap')
        this.allpages = await this.fetchSiteMap();
        logger.debug('sitemap fetched with size ... ' + this.allpages.length)
        var intervalID = setInterval(this.advancePageFetch, this.politePolicyInterval);
        // for (var i = 0; i < this.allpages.length; i++) {
        //     var page = this.allpages[i];
        //     setTimeout(function () {
        //         logger.debug('loading page ' + page);
        //     }, 5000);

        //     //let pagedownloaded = await this.fetchPage(this.allpages[i]);
        //     //logger.debug('page load over...' + pagedownloaded);
        // }
    }



    // loadpage() {
    //     fetch('https://www.vlocalshop.in/product/Y0C38CGPRA')
    //         .then(res => res.text())
    //         .then(body => {
    //             fs.writeFileSync("programming.txt", data);
    //             fs.writeFile('vlocalshop/' + 'Y0C38CGPRA.html', body, (err) => {
    //                 if (err) throw err;
    //                 console.log('Data written to file');
    //             });
    //         });
    // }

    load() {
        logger.debug('MiNi::load::url to load ' + this.sitemap);
        this.createSiteFolder();
        //this.fetchSiteMap();
        this.startIndexing();

        // sitemap.fetch(this.sitemap).then(function (sites) {
        //     var url = sites.url;
        //     var site = url.split('/')[2];
        //     var siteFolder = site.split('.');
        //     logger.debug('site=' + siteFolder.length);
        //     if (siteFolder.length == 2)
        //         logger.debug('site=' + site + ',siteFolder=' + siteFolder[0]);
        //     else if (siteFolder.length == 3)
        //         logger.debug('site=' + site + ',siteFolder=' + siteFolder[1]);


        // var allpages = sites.sites;
        // logger.debug('no of pages =' + allpages.length);
        // allpages.forEach(page => {
        //     var opage = page;
        //     var pageName = siteFolder + '/' + opage.split('/')[4] + ".html";
        //     logger.debug('site page ' + pageName);
        //     fetch(page)
        //         .then(res => res.text()).then(body => {
        //             fs.writeFileSync(pageName, body);
        //         });
        // });
        //});
    }
}

module.exports = MiNi;