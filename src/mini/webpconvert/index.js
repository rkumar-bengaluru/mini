const MiNiwebp2Webp = require('./MiNiwebp2Webp');

const runConvert = async () => {
    var options = { folder: 'vlocalshop/catalog/' ,target : 'vlocalshop/catalogv2/'};
    var mini = new MiNiwebp2Webp(options);
    mini.startAllFolder();
}

runConvert();