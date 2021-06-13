
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
            console.log('query from mini -' + query);
            var result = this.idx.search(query);
            console.log('response length from mini -' + result.length);
            var best10 = [];
            for (var i = 0; i < 10; i++)
                best10.push(result[i]);
            return best10;
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
}