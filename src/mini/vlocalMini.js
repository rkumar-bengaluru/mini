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

class vlocalMiNi {

    constructor(options) {
        if (options) {
            var opt = JSON.parse(JSON.stringify(options));
            logger.debug(JSON.stringify(opt));
            if (opt.root) {
                logger.debug('site folder ' + opt.root);
                this.siteFolder = opt.root;
                this.fileSeparator = '';
                if (this.siteFolder[this.siteFolder.length - 1] !== '/') {
                    this.fileSeparator = '/';
                }
                this.allpages = [];
                this.curPageIndex = -1;
                this.politePolicyInterval = 3000;// 5 seconds interval to load pages.
                this.pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                this.productsFolder = this.siteFolder + this.fileSeparator + "pages";
                this.allSitePages = this.siteFolder + this.fileSeparator + this.siteFolder + '.json';
                this.siteIdxFile = this.siteFolder + this.fileSeparator + this.siteFolder + '-index.json';
            }

            if (opt.loadIndex) {
                this.idx = this.loadindex();
            }
        }
    }

    fetchfiles(src) {
        var allpages = [];
        var files = fs.readdirSync(src);
        for (var i = 0; i < files.length; i++) {
            allpages.push(src + files[i]);
        }
        return allpages;
    }

    fetchsubdirs(src) {
        var allpages = [];
        var dirs = fs.readdirSync(src);
        for (var i = 0; i < dirs.length; i++) {
            allpages.push(src + this.fileSeparator + dirs[i] + '/');
        }
        return allpages;
    }

    fetchAllProducts() {
        var allpages = [];
        var site = this.productsFolder;
        var allProductsFile = this.allSitePages;
        var dirs = this.fetchsubdirs(site);
        var totalProducts = 0;
        for (var i = 0; i < dirs.length; i++) {
            logger.debug('processing dir - ' + dirs[i]);
            var productsInFolder = this.fetchfiles(dirs[i]);
            for (var j = 0; j < productsInFolder.length; j++) {
                logger.debug('processing file - ' + productsInFolder[j]);
                allpages.push({ "id": productsInFolder[j], "title": "", "description": "", "aggregateRating": {}, "image": '' });
                totalProducts++;
            }
        }
        fs.writeFileSync(allProductsFile, JSON.stringify(allpages));
        logger.debug('total products to process ' + allpages.length);
        return allpages;
    }

    fetchProductData(page) {
        var fileName = this.allSitePages;
        return new Promise((resolve, reject) => {
            logger.debug('loading product...' + page);
            var product = JSON.parse(fs.readFileSync(page));
            this.allpages[this.curPageIndex].id = product.offers.url;
            this.allpages[this.curPageIndex].title = product.name;
            this.allpages[this.curPageIndex].description = product.description;
            this.allpages[this.curPageIndex].aggregateRating = product.aggregateRating;
            this.allpages[this.curPageIndex].image = product.images[0];
            logger.debug('file Name - ' + fileName);
            fs.writeFileSync(fileName, JSON.stringify(this.allpages));
            resolve(product);
        });
    }

    advanceProductDataCollection = async () => {
        ++this.curPageIndex;
        this.pbar.update(this.curPageIndex);
        if (this.curPageIndex >= this.allpages.length) {
            this.pbar.stop();
            return;
        }
        await this.fetchProductData(this.allpages[this.curPageIndex].id);   // set new news item into the ticker
        logger.debug('this.curPageIndex = ' + this.curPageIndex + ", Of = " + this.allpages.length);
    }

    startDataPrep = async () => {
        logger.debug('creating products metadata...')
        this.allpages = await this.fetchAllProducts();
        this.pbar.start(this.allpages.length, 0);
        logger.debug('products fetched with size ... ' + this.allpages.length)
        setInterval(this.advanceProductDataCollection, this.politePolicyInterval);
    }

    createSiteIndex(siteName) {
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

}

module.exports = vlocalMiNi;