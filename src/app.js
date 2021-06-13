import css from "./css/style.css";
const MiNiWeb = require('./mini/miniweb');

let mini = new MiNiWeb();

function init() {
    try {
        document.getElementById('search_bar_txt').addEventListener('keyup', () => {
            document.getElementById('error').innerHTML = '';
            console.log('search query...' + document.getElementById('search_bar_txt').value);
            let result = mini.query(document.getElementById('search_bar_txt').value);
            console.log('result ->' + result);
        })
        document.getElementById('btn_search').addEventListener('click', () => {
            document.getElementById('error').innerHTML = '';
            console.log('search query...' + document.getElementById('search_bar_txt').value);
            let result = mini.query(document.getElementById('search_bar_txt').value);
            console.log('result ->' + result);
        })
    } catch (e) {
        console.log(e.stack);
        document.getElementById('error').innerHTML = e.message;
    }
}

init();
