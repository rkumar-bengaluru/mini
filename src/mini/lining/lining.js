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
const resizeImg = require('resize-img');
const { execFile } = require('child_process');
const cwebp = require('cwebp-bin');

class MiNiLiNing {

    constructor(src, dest) {
        this.srcDir = src;
        this.destDir = dest;
        this.allfiles = [];
        this.politePolicyInterval = 3000;// 5 seconds interval to load pages.
        this.curFileIndex = -1;
        this.allImagesToResize = [];
        this.interval = {};
        this.failed = [];
    }

    startConverting = async () => {
        logger.debug('converting...')
        this.allfiles = await this.fetchFilesToConvert(this.srcDir);
        logger.debug('this.allfiles...' + this.allfiles.length)
        setInterval(this.advanceConvert, this.politePolicyInterval);
    }

    startImageProcessing = async () => {
        logger.debug('converting...')
        this.allfiles = await this.fetchFilesToConvert(this.srcDir);
        logger.debug('this.allfiles...' + this.allfiles.length);
        this.interval = setInterval(() => {
            this.advanceConvert()
        }, this.politePolicyInterval);
        logger.debug('timer interval ' + this.interval);
    }

    advanceConvert = async () => {
        ++this.curFileIndex;
        if (this.curFileIndex >= this.allfiles.length) {
            this.processImageProcessing();
            logger.debug('timer interval ' + this.interval + ', this.curFileIndex ' + this.curFileIndex);
            clearInterval(this.interval);
            // write all failed files.
            fs.writeFileSync(this.destDir + '/failed.json', JSON.stringify(this.failed));
            logger.debug('all faied files --' + JSON.stringify(this.failed));

            return;
        }
        logger.debug('reading file...' + this.allfiles[this.curFileIndex]);
        try {
            await this.prepareProductData01(this.srcDir + this.allfiles[this.curFileIndex]);
        } catch (e) {
            logger.debug('error detected');
        } finally {
            logger.debug('finally');
        }

        //let pagedownloaded = await this.convert(this.allfiles[this.curFileIndex]);   // set new news item into the ticker
        //logger.debug('page convert over...' + pagedownloaded);
    }

    processImageProcessing() {
        this.allImagesToResize.forEach(image => {
            logger.debug('resizing image -- ' + image);
            this.resizeImage(image + '/01.jpg', image + '/01-small.jpg');
        })
    }


    fetchPage() {
        return new Promise((resolve, reject) => {
            var res = this.prepareProductData01();
            resolve(res);
        });
    }

    fetchProductFolders(srcfolder) {
        var allpages = [];
        return new Promise((resolve, reject) => {
            fs.readdir(srcfolder, (err, files) => {
                files.forEach(file => {
                    allpages.push(srcfolder + file + '/');
                });
                //logger.debug(JSON.stringify(allpages));
                resolve(allpages);
            });

        })
    }

    fetchFilesToConvert(srcfolder) {
        var allpages = [];
        logger.debug('fetching srcfolder ' + srcfolder);
        return new Promise((resolve, reject) => {
            fs.readdir(srcfolder, (err, files) => {
                files.forEach(file => {
                    allpages.push(file);
                });
                //logger.debug(JSON.stringify(allpages));
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
        // verify that this is unique.
        var dirToCheck = '../gitprojects/localshop/data/catalog/productsv2/' + result + '.json';
        if (!fs.existsSync(dirToCheck)) {
            return result;
        }
        throw new Error('ASIN already exist ' + result);
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
            //console.log('content-type:', res.headers['content-type']);
            //console.log('content-length:', res.headers['content-length']);
            //console.log('destinationFile->' + filename);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

    resizeImage(src, target) {
        (async () => {
            const image = await resizeImg(fs.readFileSync(src), {
                width: 250,
                height: 250
            });

            fs.writeFileSync(target, image);
        })();
    }

    changePrice(current) {
        var low = current - 200;
        var up = current + 200;

        low = Math.ceil(low);
        up = Math.floor(up);
        return Math.floor(Math.random() * (up - low) + low);
    }

    removeSpaceFromBegining(input) {
        if (input[0] === ' ')
            return this.removeSpaceFromBegining(input.substring(1));
        return input;
    }

    removeSpaceFromEnd(input) {
        return input.replace(/\s*$/, "");
    }

    findProductCategory(dom) {
        var category = this.findCategory(dom);
        //logger.debug('category ' + category);
        if (category === 'Badminton Racket') {
            return ' > Sports & Fitness > badminton > li-ning > racquet';
        } else if (category === 'Kit Bags') {
            return ' > Sports & Fitness > badminton > li-ning > kitbag';
        } else if (category === 'Badminton Accessories') {
            return ' > Sports & Fitness > badminton > li-ning > accessories';
        } else if (category === 'Badminton Shoes') {
            return ' > Sports & Fitness > badminton > li-ning > shoes';
        } else if (category === 'Shuttlecocks') {
            return ' > Sports & Fitness > badminton > li-ning > shuttle';
        } else if (category === 'Apparel') {
            return ' > Sports & Fitness > badminton > li-ning > apparel';
        }
        throw new Error('unknown category ' + category);
    }

    findCategory(dom) {
        var x = dom.window.document.getElementsByClassName("product_category");
        var category = x[1].textContent;
        category = category.split('\n').join('');
        category = this.removeSpaceFromBegining(category);
        category = this.removeSpaceFromEnd(category);
        return category;
    }

    findProductTitle(dom, ldson) {
        var category = this.findCategory(dom);
        //logger.debug('category ' + category);
        if (category === 'Badminton Racket') {
            return 'Li-Ning™ ' + ldson.name + ' Badminton Racquet with Free Full Cover';;
        } else if (category === 'Kit Bags') {
            return 'Li-Ning™ ' + ldson.name + ' Badminton Kit Bag';
        } else if (category === 'Badminton Accessories') {
            return 'Li-Ning™ ' + ldson.name + ' Badminton Accessories';
        } else if (category === 'Badminton Shoes') {
            return 'Li-Ning™ ' + ldson.name + ' Badminton Shoes';
        } else if (category === 'Shuttlecocks') {
            return 'Li-Ning™ ' + ldson.name + ' Badminton Shuttle';
        } else if (category === 'Apparel') {
            return 'Li-Ning™ ' + ldson.name + ' Badminton Apparel';
        }
        throw new Error('unknown category ' + category);
    }

    downloadImages(imagesDiv, asin) {
        var j = 1;
        var detination = this.destDir + 'images/' + asin;
        if (!fs.existsSync(detination)) {
            fs.mkdirSync(detination);
        }
        for (var i = 0; i < imagesDiv.length; i++) {
            var imageUrl = imagesDiv.item(i).getElementsByTagName('img').item(0).getAttribute("data-src");
            if (!imageUrl) {
                //logger.debug(imagesDiv.item(i).getElementsByTagName('img').item(0).getAttribute("src"));
                imageUrl = imagesDiv.item(i).getElementsByTagName('img').item(0).getAttribute("src");
            }
            var imagesrc = imageUrl.split('/');
            imagesrc = imagesrc[imagesrc.length - 1]
            //console.log('---' + imagesrc.split('.')[1]);
            var fileType = imagesrc.split('.')[1];
            var tmp = 'https://www.vlocalshop.in/catalog/' + asin + '/' + '0' + j + '.' + fileType;
            //this.fetchImage(imageUrl, detinationDir + '/' + '0' + j + '.' + fileType);
            var imageName = detination + '/' + '0' + j + '.' + fileType;
            var webPImageName = detination + '/' + '0' + j + '.webp';
            this.download(imageUrl, imageName, function () {
            });
            if (j == 1) {
                this.allImagesToResize.push(detination);
                //this.resizeImage(detination + '/' + '0' + j + '.' + fileType, detination + '/' + '0' + j + '-small.' + fileType);
                //logger.debug('image resizing done...');
            }

            j++;
        }
    }

    async convertImages(imageFolder) {
        logger.debug('image folder...' + imageFolder);
        var allfiles = await this.fetchFilesToConvert(imageFolder);
        logger.debug('all images..' + JSON.stringify(allfiles));
        for (var i = 0; i < allfiles.length; i++) {
            var imageName = imageFolder + allfiles[i];
            logger.debug('image to convert...' + imageName);
            var webPImageName = allfiles[i].split('.')[0] + '.webp';
            execFile(cwebp, [imageName, '-o', imageFolder + webPImageName], err => {
                if (err) {
                    logger.debug(err.stack);
                    logger.debug('webp convertion failed ' + webPImageName);
                } else {
                    logger.debug('webp convertion success ' + webPImageName);
                }
            });
        }

    }

    convertJPG2Web = async () => {
        logger.debug('converting webp...');
        var srcDir = this.destDir + 'images/';
        var allimgfolders = await this.fetchProductFolders(srcDir);
        for (var i = 0; i < allimgfolders.length; i++) {
            this.convertImages(allimgfolders[i]);
        }
    }

    removeAllJPEG = async () => {
        logger.debug('converting webp...');
        var srcDir = this.destDir + 'images/';
        var allimgfolders = await this.fetchProductFolders(srcDir);
        for (var i = 0; i < allimgfolders.length; i++) {
            this.removeAllImages(allimgfolders[i]);
        }
    }

    async removeAllImages(imageFolder) {
        logger.debug('image folder...' + imageFolder);
        var allfiles = await this.fetchFilesToConvert(imageFolder);
        logger.debug('all images..' + JSON.stringify(allfiles));
        for (var i = 0; i < allfiles.length; i++) {
            var imageName = imageFolder + allfiles[i];
            var type = imageName.split('.')[1];
            if (type === 'jpg') {
                fs.unlinkSync(imageName);
                logger.debug('removing...' + imageName);
            }
            
        }

    }

    formatMRP(mrp) {
        var n = mrp.split(',').join('');
        n = n.split('.')[0];
        return n;
    }

    probe(page) {
        this.prepareProductData01(page);
    }

    createSuccessList() {

    }

    prepareProductData01(page) {

        try {
            JSDOM.fromFile(page, {}).then(dom => {
                var ldson = JSON.parse(dom.window.document.querySelector('script[type="application/ld+json"]').innerHTML);
                var asin = ldson.sku;
                //var asin = this.createASIN();
                var product = { "@context": 'https://schema.org', '@id': 'https://www.vlocalshop.in/product/' + asin, '@type': 'Product' };
                var category = this.findCategory(dom);
                logger.debug('product category - ' + category);
                if (category === 'Badminton Racket') {
                    logger.debug('mapping product - ' + asin);
                    product.productID = asin;
                    product.name = this.findProductTitle(dom, ldson);
                    product.sku = asin;
                    product.mpn = asin;
                    let brand = { '@type': 'Brand', name: ldson.brand.name };
                    product.brand = brand;
                    product.description = ldson.description;
                    product.manufacturer = 'Li-Ning';
                    product.category = this.findProductCategory(dom);
                    product.logo = 'https://www.vlocalshop.in/catalog/' + asin + '/01.jpg';
                    var changedPrice = this.changePrice(ldson.offers[0].price);
                    //logger.debug('offer price ' + ldson.offers[0].price + ", newOffer " + changedPrice);
                    let offers = {
                        "@type": "Offer",
                        "url": 'https://www.vlocalshop.in/product/' + asin,
                        "priceCurrency": "INR",
                        "price": changedPrice,
                        "priceValidUntil": "2030-12-31",
                        "itemCondition": "https://schema.org/NewCondition",
                        "availability": "https://schema.org/InStock"
                    };
                    product.offers = offers;
                    let images = [];
                    var imagesDiv = dom.window.document.getElementsByClassName("gallery-item");

                    var j = 1;
                    for (var i = 0; i < imagesDiv.length; i++) {
                        var imageUrl = imagesDiv.item(i).getElementsByTagName('img').item(0).getAttribute("data-src");
                        if (!imageUrl) {
                            //logger.debug(imagesDiv.item(i).getElementsByTagName('img').item(0).getAttribute("src"));
                            imageUrl = imagesDiv.item(i).getElementsByTagName('img').item(0).getAttribute("src");
                        }

                        var imagesrc = imageUrl.split('/');
                        imagesrc = imagesrc[imagesrc.length - 1]
                        var fileType = imagesrc.split('.')[1];
                        var tmp = 'https://rkumar-bengaluru.github.io/vlocalshop.webp/catalog/' + asin + '/' + '0' + j + '.webp';
                        images.push(tmp);
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
                    mrp = this.formatMRP(mrp);

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
                        //console.log('header->' + header + ", body->" + body);
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
                    fs.writeFileSync(this.destDir + '/productsv2/' + asin + '.json', JSON.stringify(product));
                    this.downloadImages(imagesDiv, asin);

                    //this.resizeImage(detination + '/' + '01.' + fileType,detination + '/' + '01-small.' + fileType);
                    //logger.debug(JSON.stringify(product));
                }
            });

        } catch (e) {
            console.log('--------------' + e.message);
            this.failed.push(page);
            logger.debug(e.stack);

            throw e;
        }

    }

}

module.exports = MiNiLiNing;