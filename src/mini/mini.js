
class MiNi {
    constructor(_sitemap) {
        this.sitemap = _sitemap;
    }

    load() {
        console.log('url to load ' + this.sitemap);
    }
}

module.exports = MiNi;