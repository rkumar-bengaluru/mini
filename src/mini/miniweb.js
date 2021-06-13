
const lunr = require("lunr");

class MiNiWeb {

    constructor() {
        this.siteIdxFile = 'index/vlocalshop-index.json';
        this.idx = this.loadindex();
    }

    search(query) {
        try {
            var result = this.idx.search(query);
            return result;
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
}

module.exports = MiNiWeb;