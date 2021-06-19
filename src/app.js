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
mini_head += '<div id=\'mini-results-response-time\' class=\'mini-results-response-time\'></div>';

function renderMeta(ratings,review) {
    var currentRating = parseFloat((ratings)).toFixed(1);
    var meta = '<div class=\"stars-wrapper stars mb-2\">';
    meta += '<div>';
    var noOfStars = Math.floor(currentRating);
    var decimal = currentRating - noOfStars;
    var halfstar = false;
    if(decimal > 0)
        halfstar = true;
    
    console.log('noOfStars - ' + noOfStars + ", halfStars - " + halfstar);
    meta += '<div class=\"stars-wrapper stars-main\">';
    meta += '<div>';
    for(var i = 0; i < noOfStars;i++) {
        meta += '<img width=\'16\' height=\'15\' src=\'/mini/images/star.svg\' alt=\'five star ratings\' />';
    } 
    if(halfstar) {
        meta += '<img width=\'16\' height=\'15\' src=\'/mini/images/half-star.svg\' alt=\'five star ratings\' />';
    }
    meta += ' Ratings - ' + ratings + ' - ' + review + 'reviews';
    meta += '</div>';
    meta += '</div>';
    meta += '</div>';
    meta += '</div>';
    return meta;
}

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
    var rtime = 'About ' + result.total + ' resuls in ' + result.time + ' seconds,filtered best ' + result.bestCount + ' below...'
    console.log('rtime->' + rtime);
    document.getElementById('mini-results-response-time').innerHTML = rtime;
    var response = '';
    result.best.forEach(function (r) {
        if (typeof r !== 'undefined') {
            var title = r.title.substring(0, 50) + '...';
            response += '<div class=\"mini-result-row\"><div class=\"row\">';
            response += '<div class=\'column\'><div class=\"mini-result-img\"><img heigth=\'100px\' width=\'100px\' src=' + r.image + ' alt=' + r.title + '/></div></div>';
            response += '<div class=\'column\'>';
            response += '<div class=\"mini-result-src\"><a target=\'_blank\'href=\'' + r.id + '\'>' + r.id + '</a></div>';
            response += '<a target=\'_blank\'href=\'' + r.id + '\'>' + '<div class=\"mini-result-title\">' + title + '</div></a>';
            response += '<div class=\"mini-result-desc\">' + r.description + '</div>';
            response += '<div class=\"mini-result-meta\"> '
            response += renderMeta(r.aggregateRating.ratingValue,r.aggregateRating.reviewCount);
            response += '</div>';
            response += '</div></div></div><br>';
        }
    });
    if (result.total === 0) {
        console.log('no data' + result.total);
        document.getElementById('mini-results').innerHTML = '<span class=\"mini-error\">Sorry no results matching your criteria...</span>';

    } else {
        console.log('no of results ' + result.total);
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
