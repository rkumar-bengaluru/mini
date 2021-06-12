var logger = require('./logger/logger');
const fetch = require('node-fetch');
const Sitemapper = require('sitemapper');
var fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cliProgress = require('cli-progress');
const lunr = require("lunr");
const { isDebugEnabled } = require('./logger/logger');

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
        this.sitemapFileName = this.siteFolder + '/' + this.siteFolder + '.json'
        this.allpages = [];
        this.curPageIndex = -1;
        this.politePolicyInterval = 3000;// 5 seconds interval to load pages.
        this.pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        this.pagesFolder = this.folder + "/pages";
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
            if (!fs.existsSync(this.pagesFolder)) {
                fs.mkdirSync(this.pagesFolder);
                logger.debug('MiNi::load:: site folder created ' + this.pagesFolder);
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
                    allpages.push({ "id": page, "title": "", "keywords": "", "description": "" });
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
            var pageName = this.pagesFolder + '/';
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
                this.prepareindexdata(pageName);
            });
            resolve(pageName);
        });
    }

    advancePageFetch = async () => {
        ++this.curPageIndex;
        this.pbar.update(this.curPageIndex);
        if (this.curPageIndex >= this.allpages.length) {
            this.pbar.stop();
            return;
        }
        let pagedownloaded = await this.fetchPage(this.allpages[this.curPageIndex].id);   // set new news item into the ticker
        logger.debug('page load over...' + pagedownloaded);
    }

    startIndexing = async () => {
        logger.debug('fetching sitemap')
        this.allpages = await this.fetchSiteMap();
        this.pbar.start(this.allpages.length, 0);
        logger.debug('sitemap fetched with size ... ' + this.allpages.length)
        setInterval(this.advancePageFetch, this.politePolicyInterval);
    }

    loadsite() {
        logger.debug('MiNi::load::url to load ' + this.sitemap);
        this.createSiteFolder();
        this.startIndexing();
    }

    prepareindexdata(pageName) {
        try {
            JSDOM.fromFile(pageName, {}).then(dom => {
                this.allpages[this.curPageIndex].title = dom.window.document.querySelector("title").textContent;
                this.allpages[this.curPageIndex].description = dom.window.document.head.querySelector("[name=\"description\"]").content;
                this.allpages[this.curPageIndex].keywords = dom.window.document.head.querySelector("[name=\"keywords\"]").content;
                fs.writeFileSync(this.sitemapFileName, JSON.stringify(this.allpages));
            });
        } catch (e) {
            logger.debug(e.stack);
            throw e;
        }
    }

    createLunrIndex(fileName, siteName) {
        fs.readFile(fileName, (err, data) => {
            if (err) {
                console.log('error reading file - ' + fileName);
                console.log(err.stack);
            }
            var products = JSON.parse(data);
            console.log('products size -' + products.length);
            try {
                var idx = lunr(function () {
                    this.ref('id')
                    this.field("title")

                    for (let i = 0; i < products.length; i++) {
                        this.add(products[i])
                    }
                });
                var serializedIdx = JSON.stringify(idx);
                fs.writeFile(siteName + '-index.json', serializedIdx, (err) => {
                    if (err) throw err;
                    console.log('index written to file');
                });
            } catch (e) {
                console.log(e.stack);
                throw e;
            }
        });
    }

    loadindex() {
        var data = fs.readFileSync('vlocalshop-index.json');
        var idx = lunr.Index.load(JSON.parse(data));
        return idx;
    }

    search(query) {
        try {
            let idx = this.loadindex();
            logger.debug('loaded index file.' + idx);
            var result = idx.search(query);
            return result;
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
}

module.exports = MiNi;