
const fs = require("fs");
var logger = require('../../src/mini/logger/logger');
const MiNi = require('../../src/mini/mini');
import 'regenerator-runtime/runtime'

var instance = null;

beforeEach(() => {
   
});

test('https://prokicksports.com/sitemap_products_1.xml?from=3007608946769&to=6585087262801', () => {
    instance = new MiNi('https://prokicksports.com/sitemap_products_1.xml?from=3007608946769&to=6585087262801');
    expect(instance.folder).toBe("prokicksports");
    expect(instance.home).toBe("https://prokicksports.com");
});

test('https://www.vlocalshop.in/sitemap.xml', () => {
    instance = new MiNi('https://www.vlocalshop.in/sitemap.xml');
    expect(instance.folder).toBe("vlocalshop");
    expect(instance.home).toBe("https://www.vlocalshop.in");
});