var logger = require('./logger/logger');
const fetch = require('node-fetch');
const Sitemapper = require('sitemapper');
var fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cliProgress = require('cli-progress');
const lunr = require("lunr");
const { isDebugEnabled } = require('../logger/logger');

class MiNiLiNing {

    constructor(page) {
        this.pageName = page;
    }

    fetchPage() {
        return new Promise((resolve, reject) => {
            var res = this.prepareProductData01();
            resolve(res);
        });
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

    prepareProductData01() {
        try {

            JSDOM.fromFile(this.pageName, {}).then(dom => {
                var ldson = JSON.parse(dom.window.document.querySelector('script[type="application/ld+json"]').innerHTML);
                var product = { "@context": 'https://schema.org', '@id': 'https://www.vlocalshop.in/product/' + ldson.sku, '@type': 'Product' };
                product.productID = ldson.sku;
                product.name = dom.window.document.querySelector("title").textContent;
                product.sku = ldson.sku;
                product.mpn = ldson.sku;
                let brand = { '@type': 'Brand', name: ldson.brand.name };
                product.brand = brand;
                product.description = ldson.description;
                let offers = {
                    "@type": "Offer",
                    "url": 'https://www.vlocalshop.in/product/' + ldson.sku,
                    "priceCurrency": "INR",
                    "price": ldson.offers[0].price,
                    "priceValidUntil": "2030-12-31",
                    "itemCondition": "https://schema.org/NewCondition",
                    "availability": "https://schema.org/InStock"
                };
                product.offers = ldson.offers;
                let images = [];
                var x = dom.window.document.getElementsByClassName("gallery-item");
                for (var i = 0; i < x.length; i++) {
                    images.push(x.item(i).getElementsByTagName('img').item(0).getAttribute("data-src"));
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
                var x = dom.window.document.getElementsByClassName("mrp");
                console.log(x.item(0).textContent.split('').join());
                let vlocal = {
                    "COO": 'Thailand',
                    "Status": 'Active',
                    "MOQ": 1,
                    "TAX": 12,
                    "HSN": 9506,
                    //"MRP": srcJson.mrp,
                    //"keyFeatures": features,
                    "KEYWORDS": ldson.description,
                    //"MARKET": market
                }
                product.vlocal = vlocal;
                logger.debug(JSON.stringify(product));
            });
        } catch (e) {
            logger.debug(e.stack);
            throw e;
        }
    }

}

module.exports = MiNiLiNing;