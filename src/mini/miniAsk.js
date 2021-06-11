
const inquirer = require('inquirer');
const fetch = require('node-fetch');


module.exports = {
    askUrlToIndex: () => {
        var expression =
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        var regex = new RegExp(expression);
        const questions = [
            {
                name: 'url',
                type: 'input',
                message: 'Enter your website sitemap url:',
                validate: function (value) {
                    if (value.match(regex)) {
                        return true;
                    } else {
                        return 'Please enter valid website sitemap url.';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
};