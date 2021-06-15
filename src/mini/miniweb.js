
const lunr = require("lunr");
let json = require('../../index/vlocalshop-index.json');

export default class MiNiWeb {

    constructor() {
        this.siteIdxFile = 'index/vlocalshop-index.json';
        this.idx = this.loadindex();
        console.log('loaded in browser');
    }

    loadindex() {
        var idx = lunr.Index.load(json);
        return idx;
    }

    search(query) {
        try {
            var t1 = Math.round(Date.now() );
            console.log('query from mini -' + query);
            var result = this.idx.search(query);
            var best10 = [];
            for (var i = 0; i < 10; i++)
                best10.push(result[i]);
            var t2 = Math.round(Date.now());
            var diff = ((t2-t1)/1000).toFixed(3);
            console.log('response length from mini -' + result.length + ',diff-' + diff);
            var response = { 'total': result.length, 'time': diff, 'bestCount': 10, 'best': best10 }

            return response;
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
}