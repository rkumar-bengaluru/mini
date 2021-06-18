var logger = require('../logger/logger');
const fetch = require('node-fetch');
const Sitemapper = require('sitemapper');
var fs = require('fs'),
    request = require('request');;
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cliProgress = require('cli-progress');
const lunr = require("lunr");
const { isDebugEnabled } = require('../logger/logger');

class MiNiLiNing {

    constructor(src, dest) {
        this.srcDir = src;
        this.destDir = dest;
        this.allfiles = [];
        this.politePolicyInterval = 5000;// 5 seconds interval to load pages.
        this.curFileIndex = -1;
    }

    startConverting = async () => {
        logger.debug('converting...')
        this.allfiles = await this.fetchFilesToConvert(this.srcDir);
        logger.debug('this.allfiles...' + this.allfiles.length)
        setInterval(this.advanceConvert, this.politePolicyInterval);
    }

    advanceConvert = async () => {
        ++this.curFileIndex;
        if (this.curFileIndex >= this.allfiles.length) {
            return;
        }
        logger.debug('reading file...' + this.allfiles[this.curFileIndex]);
        this.prepareProductData01(this.srcDir + this.allfiles[this.curFileIndex]);
        //let pagedownloaded = await this.convert(this.allfiles[this.curFileIndex]);   // set new news item into the ticker
        //logger.debug('page convert over...' + pagedownloaded);
    }


    fetchPage() {
        return new Promise((resolve, reject) => {
            var res = this.prepareProductData01();
            resolve(res);
        });
    }

    fetchFilesToConvert(srcfolder) {
        var allpages = [];
        logger.debug('fetching srcfolder ' + srcfolder);
        return new Promise((resolve, reject) => {
            fs.readdir(srcfolder, (err, files) => {
                files.forEach(file => {
                    allpages.push(file);
                });
                logger.debug(allpages);
                resolve(allpages);
            });

        })
    }

    createASIN() {
        var length = 10;
        logger.debug("/create -->" + length);
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;

        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        logger.debug("/create -->" + result);
        return result;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    genRandomRatings(min, max, decimalPlaces) {
        var rand = Math.random() * (max - min) + min;
        var power = Math.pow(10, decimalPlaces);
        return Math.floor(rand * power) / power;
    }

    removeSpecialChars(input) {
        var tmp = input.split(' ').join('');
        return tmp.split('\n').join(' ');
    }

    download = function (uri, filename, callback) {
        request.head(uri, function (err, res, body) {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            console.log('destinationFile->' + filename);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

    fetchImage(imageUrl, destFile) {
        return new Promise((resolve, reject) => {
            logger.debug('loading image...' + imageUrl);
            fetch(imageUrl).then(res => res.text()).then(body => {
                fs.writeFileSync(destFile, body);
            });
            resolve(imageUrl);
        });
    }

    prepareProductData01(page) {
        try {

            JSDOM.fromFile(page, {}).then(dom => {
                var ldson = JSON.parse(dom.window.document.querySelector('script[type="application/ld+json"]').innerHTML);
                var product = { "@context": 'https://schema.org', '@id': 'https://www.vlocalshop.in/product/' + ldson.sku, '@type': 'Product' };
                product.productID = ldson.sku;
                product.name = 'Li-Ning ' + ldson.name;
                product.sku = ldson.sku;
                product.mpn = ldson.sku;
                let brand = { '@type': 'Brand', name: ldson.brand.name };
                product.brand = brand;
                product.description = ldson.description;
                product.manufacturer = 'Li-Ning';
                product.category = ' > Sports & Fitness > badminton > li-ning > racquet';
                product.logo = 'https://www.vlocalshop.in/catalog/' + ldson.sku + '/01.jpg';

                let offers = {
                    "@type": "Offer",
                    "url": 'https://www.vlocalshop.in/product/' + ldson.sku,
                    "priceCurrency": "INR",
                    "price": ldson.offers[0].price,
                    "priceValidUntil": "2030-12-31",
                    "itemCondition": "https://schema.org/NewCondition",
                    "availability": "https://schema.org/InStock"
                };
                product.offers = offers;
                let images = [];
                var x = dom.window.document.getElementsByClassName("gallery-item");
                var j = 1;
                var detination = this.destDir + 'images/' + ldson.sku;
                if (!fs.existsSync(detination)) {
                    fs.mkdirSync(detination);
                }
                for (var i = 0; i < x.length; i++) {
                    var imageUrl = x.item(i).getElementsByTagName('img').item(0).getAttribute("data-src");
                    var imagesrc = imageUrl.split('/');
                    imagesrc = imagesrc[imagesrc.length - 1]
                    console.log('---' + imagesrc.split('.')[1]);
                    var fileType = imagesrc.split('.')[1];
                    var tmp = 'https://www.vlocalshop.in/catalog/' + ldson.sku + '/' + '0' + j + '.' + fileType;
                    //this.fetchImage(imageUrl, detinationDir + '/' + '0' + j + '.' + fileType);
                    this.download(imageUrl, detination + '/' + '0' + j + '.' + fileType, function () {
                        console.log('done');
                    });
                    images.push(tmp);
                    j++;
                }
                product.images = images;
                let aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": this.genRandomRatings(3, 5, 1),
                    "ratingCount": this.getRandomInt(5, 23),
                    "reviewCount": this.getRandomInt(2, 9)
                };
                product.aggregateRating = aggregateRating;
                let reviews = [];

                product.review = reviews;
                var x = dom.window.document.getElementsByClassName("mrp").item(0).textContent;
                var mrp = this.removeSpecialChars(x).substring(2);
                console.log('mrp ->' + mrp);
                let market = {
                    "amazon": 'NA',
                    "amazonPrice": 'NA',
                    "flipkart": 'NA',
                    "flipkartPrice": 'NA'
                };
                let features = [];
                var specs = dom.window.document.getElementById("product-attribute-specs-table");
                for (var i = 0; i < specs.rows.length; i++) {
                    var header = specs.rows[i].cells[0].textContent
                    header = this.removeSpecialChars(header);
                    var body = specs.rows[i].cells[1].textContent
                    body = this.removeSpecialChars(body);
                    console.log('header->' + header + ", body->" + body);
                    var feature = header + ':' + body;
                    features.push(feature);
                }

                let vlocal = {
                    "COO": 'Thailand',
                    "Status": 'Active',
                    "MOQ": 1,
                    "TAX": 12,
                    "HSN": 9506,
                    "MRP": mrp,
                    "keyFeatures": features,
                    "KEYWORDS": ldson.description,
                    "MARKET": market
                }
                product.vlocal = vlocal;
                fs.writeFileSync(this.destDir + '/productsv2/' + ldson.sku + '.json', JSON.stringify(product));

                logger.debug(JSON.stringify(product));
            });
        } catch (e) {
            logger.debug(e.stack);
            throw e;
        }
    }

}

module.exports = MiNiLiNing;