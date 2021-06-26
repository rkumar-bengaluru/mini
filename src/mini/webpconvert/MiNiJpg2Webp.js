const { execFile } = require('child_process');
const cwebp = require('cwebp-bin');
var logger = require('../logger/logger');
var fs = require('fs');
const cliProgress = require('cli-progress');

class MiNiJpg2Webp {

    constructor(options) {
        if (options) {
            var opt = JSON.parse(JSON.stringify(options));
            this.src = opt.folder;
            this.target = opt.target;
            this.politePolicyInterval = 5000;// 5 seconds interval to load pages.
            this.curPageIndex = -1;
            this.pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        }
    }

    startFolder() {
        logger.debug('\nMiNiJpg2Webp::startConverting ' + this.sitemap);
        this.startConverting();
    }

    startAllFolder() {
        logger.debug('\nMiNiJpg2Webp::startConverting ' + this.sitemap);
        this.startConvertingFolders();
    }

    startConverting = async () => {
        this.allfiles = await this.fetchFilesToConvert();
        logger.debug('\n' + this.allfiles);
        this.pbar.start(this.allfiles.length, 0);
        logger.debug('allfiles size ... ' + this.allfiles.length)
        setInterval(this.advanceConvert, this.politePolicyInterval);
    }

    startConvertingFolders = async () => {
        this.allfolders = await this.fetchFoldersToConvert();
        this.pbar.start(this.allfolders.length, 0);
        logger.debug('allfiles size ... ' + this.allfolders.length)
        setInterval(this.advanceConvertFolder, this.politePolicyInterval);
    }

    advanceConvertFolder = async () => {
        ++this.curPageIndex;
        this.pbar.update(this.curPageIndex);
        if (this.curPageIndex >= this.allfolders.length) {
            this.pbar.stop();
            return;
        }
        await this.convertFolder(this.allfolders[this.curPageIndex]);   // set new news item into the ticker
    }

    advanceConvert = async () => {
        ++this.curPageIndex;
        this.pbar.update(this.curPageIndex);
        if (this.curPageIndex >= this.allfiles.length) {
            this.pbar.stop();
            return;
        }
        await this.convert(this.allfiles[this.curPageIndex]);   // set new news item into the ticker
    }

    convertFolder(folder) {
        return new Promise((resolve, reject) => {
            var srcFolder = this.src + folder + '/';
            var targetFolder = this.target + folder + '/';
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder);
            }
            logger.debug('\nconverting folder... - ' + srcFolder + ", target ->" + targetFolder);
            fs.readdir(srcFolder, (err, files) => {
                files.forEach(file => {
                    var src = srcFolder + file;
                    var target = targetFolder + file.split('.')[0] + '.webp';
                    logger.debug('\nfile to convert - ' + src + ', target - ' + target);
                    execFile(cwebp, [src, '-o', target], err => {
                        if (err) {
                            throw err;
                        }
        
                        logger.debug('Image is converted!' + target);
                    });
                });
            });
            resolve(srcFolder);
        });
    }


    convert(page) {
        return new Promise((resolve, reject) => {
            var fileName = this.src + page;
            var target = this.src + page.split('.')[0] + '.webp';
            logger.debug('\nconverting file... - ' + fileName + ", target ->" + target);
            execFile(cwebp, [fileName, '-o', target], err => {
                if (err) {
                    throw err;
                }

                console.log('Image is converted!');
            });
            resolve(fileName);
        });
    }

    fetchFoldersToConvert() {
        var allfiles = [];
        logger.debug('fetching srcfolder ' + this.src);
        return new Promise((resolve, reject) => {
            fs.readdir(this.src, (err, files) => {
                files.forEach(file => {
                    allfiles.push(file);
                });
                resolve(allfiles);
            });
        })
    }

    fetchFilesToConvert() {
        var allfiles = [];
        logger.debug('fetching srcfolder ' + this.src);
        return new Promise((resolve, reject) => {
            fs.readdir(this.src, (err, files) => {
                files.forEach(file => {
                    if (file.split('.')[1] === 'jpg')
                        allfiles.push(file);
                });
                logger.debug(allfiles);
                resolve(allfiles);
            });
        })
    }
}

module.exports = MiNiJpg2Webp;