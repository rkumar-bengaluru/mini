const MiNi = require('./lining');

const runMapping = async() => {
    var mini = new MiNi('lining/pages/airforce-g2-77-grams-black-blue.html');
    mini.prepareProductData01();
}

runMapping();