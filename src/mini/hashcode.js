function hashcode(s) {
    let h = 0;
    for(let i = 0; i < s.length; i++) 
          h = h + Math.imul(31, h) + s.charCodeAt(i) | 0;

    return h;
}

function jhashcode(s) {
    var h = 0, i = s.length;
    while (i > 0) {
        h = (h << 5) - h + s.charCodeAt(--i) | 0;
    }
    return h; 
}

function createPageNIndex(s) {
    let hash = jhashcode(s);
    // 100 index per page.
    var indexPerPage = 100;
    var page = ~~(hash / indexPerPage);
    var idx = hash % indexPerPage;
    var r =  {"input" : s, "hash": hash, "page" : page,"index" : idx}
    console.log(JSON.stringify(r));
}

createPageNIndex('my name is rupak');
createPageNIndex('my name is rupa');
createPageNIndex('my name is rup');
createPageNIndex('my name is ru');
createPageNIndex('my name is kapur');