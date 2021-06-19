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

    constructor(options) {
        if (options) {
            var opt = JSON.parse(JSON.stringify(options));
            logger.debug(JSON.stringify(opt));
            if (opt.url) {
                logger.debug('url to fetch ' + opt.url);
                this.sitemap = opt.url;
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
                this.siteIdxFile = this.siteFolder + '/' + this.siteFolder + '-index.json';
            }

            if (opt.loadIndex) {
                this.idx = this.loadindex();
            }
        }
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
                    allpages.push({ "id": page, "title": "", "description": "", "aggregateRating": {} });
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
                var ldscript = dom.window.document.querySelector('script[type="application/ld+json"]');
                if (ldscript) {
                    var jsonld = JSON.parse(ldscript.innerHTML);
                    this.allpages[this.curPageIndex].aggregateRating = jsonld.aggregateRating;
                }
                fs.writeFileSync(this.sitemapFileName, JSON.stringify(this.allpages));
            });
        } catch (e) {
            logger.debug(e.stack);
            throw e;
        }
    }

    test(pageName) {
        return new Promise((resolve, reject) => {
            try {
                var t = JSDOM.fromFile(pageName, {}).then(dom => {
                    var title = dom.window.document.querySelector("title").textContent;
                    var ldscript = dom.window.document.querySelector('script[type="application/ld+json"]');
                    var jsonld = JSON.parse(ldscript.innerHTML);
                    console.log(jsonld.aggregateRating)
                    return title;
                });
                resolve(t);
            } catch (e) {
                logger.debug(e.stack);
                reject(e);
            }
        });

    }

    createIndexForSite(siteName) {
        var siterawfile = siteName + '/' + siteName + '.json';
        fs.readFile(siterawfile, (err, data) => {
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
                fs.writeFile(this.siteIdxFile, serializedIdx, (err) => {
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
        var data = fs.readFileSync(this.siteIdxFile);
        var idx = lunr.Index.load(JSON.parse(data));
        this.allpages = JSON.parse(fs.readFileSync(this.sitemapFileName));

        return idx;
    }

    search(query) {
        try {
            var result = this.idx.search(query);
            return result.map((item) => {
                return this.allpages.find((p) => item.ref === p.id)
            })

        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }

    updateFileWithImage(fileName) {
        try {
            var data = fs.readFileSync(fileName);
            var all = JSON.parse(data);
            all.forEach(function (p) {
                if (p.id.includes('product/')) {
                    var image = p.id.replace('product', 'catalog') + '/01-small.jpg';
                    p.image = image;
                    logger.debug('image ->' + image);
                }
            })
            var updated = JSON.stringify(all);
            logger.debug('update ' + updated);
            fs.writeFile(fileName, updated, (err) => {
                if (err) throw err;
                console.log('index written to file');
            });
        } catch (e) {
            throw e;
        }
    }
}

module.exports = MiNi;