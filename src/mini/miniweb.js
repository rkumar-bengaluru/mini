
const lunr = require("lunr");
let indexFile = require('../../vlocalshop/vlocalshop-index.json');
let productMetaFile = require('../../vlocalshop/vlocalshop.json');

export default class MiNiWeb {

    constructor() {
        this.idx = this.loadindex();
        this.allProducts = productMetaFile;
        console.log('loaded in browser');
    }

    loadindex() {
        var idx = lunr.Index.load(indexFile);
        return idx;
    }

    search(query) {
        try {
            var t1 = Math.round(Date.now() );
            console.log('query from mini -' + query);
            var result = this.idx.search(query);
            var response = result.map((item) => {
                return this.allProducts.find((p) => item.ref === p.id)
            })
            var best10 = [];
            for (var i = 0; i < 10; i++)
                best10.push(result[i]);
            var t2 = Math.round(Date.now());
            var diff = ((t2-t1)/1000).toFixed(3);
            console.log('response length from mini -' + result.length + ',diff-' + diff);
            var response = { 'total': result.length, 'time': diff, 'bestCount': 10, 'best': response }

            return response;
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
}