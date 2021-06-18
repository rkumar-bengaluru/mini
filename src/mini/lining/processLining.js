const MiNi = require('./lining');

const runMapping = async() => {
    var mini = new MiNi('lining/itr1/','lining/catalog/');
    mini.startConverting();
}

runMapping();