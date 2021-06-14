import css from "./css/style.css";
import MiNiWeb from './mini/miniweb';

let mini = new MiNiWeb();
var mini_head = '<div class=\"row\">';
mini_head += '<div class=\"column\"><a href=\'/mini\'><img src=\"images/mini.svg\" alt=\"Mini\" class=\"mini_logo_small\"></a></div>';
mini_head += '<div class=\"column\"><div class=\"search-btns\"><div class=\"mini-search-bar\"><input id=\'mini-search-input\' type=\"text\" autofocus>';
mini_head += '<div class=\"mic_space\"> <img src=\"images/m-mic.png\" alt=\"Mic\" class=\"mic_icon\"> </div>';
mini_head += '</div></div></div>';
mini_head += '<div class=\"column\"><div class=\"mini-search-btns\"><div class=\"mini-btns-centered\">';
mini_head += '<button id=\"mini-btn-search\" >Mini Search</button><br><span class=\"mini-error btns_centered\" id=\'error\'></span>';
mini_head += ' </div></div></div>';
mini_head += '</div>';

function performsearch() {
    document.getElementById('error').innerHTML = '';
    var query = document.getElementById('mini-search-input').value;
    console.log('query =' + query);
    if (query === '' || query.length === 0) {
        document.getElementById('error').innerHTML = 'please enter a valid query'
        return;
    }
    document.getElementById('mini-head').innerHTML = mini_head;

    document.getElementById('mini-search-input').value = query;
    console.log('search query...' + query);
    let result = mini.search(query);
    console.log('response size...' + result.length);

    var response = '';
    result.forEach(function (r) {
        if (typeof r !== 'undefined') {
            response += '<div class=\"mini-result-row\"><div class=\"row\"><div class=\'column\'>';
            response += '<div class=\"mini-result-src\"><a target=\'_blank\'href=\'' + r.ref + '\'>' + r.ref + '</a></div>';
            response += '<a target=\'_blank\'href=\'' + r.ref + '\'>' + '<div class=\"mini-result-title\">' + r.ref + '</div></a></div>';
            response += '<div class=\"mini-result-desc\">' + 'description to do' + '</div>';
            if (r.score) {
                response += '<div class=\"mini-result-meta\">' + r.score + '</div>';
            } else {
                response += '<div class=\"mini-result-meta\">' + 'NA' + '</div>';
            }
            response += '</div></div></div>';
        }
    });
    if (result.length === 0) {
        console.log('no data' + result.length);
        document.getElementById('mini-results').innerHTML = '<span class=\"mini-error\">Sorry no results matching your criteria...</span>';

    } else {
        console.log('no of results ' + result.length);
        document.getElementById('mini-results').innerHTML = response;
    }
    init();
}

function init() {
    try {
        console.log(document.getElementById('mini-search-input'));
        document.getElementById('mini-search-input').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                console.log('enter clicked...');
                event.preventDefault();
                performsearch();
                return;
            }
            document.getElementById('error').innerHTML = '';
        })
        document.getElementById('mini-btn-search').addEventListener('click', () => {
            performsearch();
        })
    } catch (e) {
        console.log(e.stack);
        document.getElementById('error').innerHTML = e.message;
    }
}

init();
