import css from "./css/style.css";
import MiNiWeb from './mini/miniweb';

let current = 0;
let totalNoOfPages = 0;
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

function renderMeta(ratings, review) {
    var currentRating = parseFloat((ratings)).toFixed(1);
    var meta = '<div class=\"stars-wrapper stars mb-2\">';
    meta += '<div>';
    var noOfStars = Math.floor(currentRating);
    var decimal = currentRating - noOfStars;
    var halfstar = false;
    if (decimal > 0)
        halfstar = true;

    meta += '<div class=\"stars-wrapper stars-main\">';
    meta += '<div>';
    //console.log('star image change - src=\"images/mini.svg\"');
    for (var i = 0; i < noOfStars; i++) {
        meta += '<img width=\'16\' height=\'15\' src=\"images/star.svg\" alt=\'five star ratings\' />';
    }
    if (halfstar) {
        meta += '<img width=\'16\' height=\'15\' src=\"images/half-star.svg\" alt=\'five star ratings\' />';
    }
    meta += ' Ratings - ' + ratings + ' - ' + review + ' reviews';
    meta += '</div>';
    meta += '</div>';
    meta += '</div>';
    meta += '</div>';
    return meta;
}

function linkClicked(e) {
    e.preventDefault();
    //console.log('current - ' + current + ', totalNoOfPages - ' + totalNoOfPages);
    if (e.target.textContent === 'Previous') {
        --current;
        if (current > 0) {
            performsearch(current);
        }else {
            ++current;
        }
    } else if (e.target.textContent === 'Next') {
        ++current;
        if (current < totalNoOfPages) {
            performsearch(current);
        } else {
            --current;
        }
    } else {
        performsearch(e.target.textContent);
    }

    //console.log(e.target.tagName);
}

function doPaging(current, total, r) {

    let currentPage = current, // input
        range = r,  // amount of links displayed 
        totalPages = total, // determined by amount of items, hardcoded for readability 
        start = 0;  // default

    let paging = [];      // output variable

    // Don't use negative values, force start at 1
    if (currentPage < (range / 2) + 1) {
        start = 1;

        // Don't go beyond the last page 
    } else if (currentPage >= (totalPages - (range / 2))) {
        start = Math.floor(totalPages - range + 1);

    } else {
        start = (currentPage - Math.floor(range / 2));
    }

    for (let i = start; i <= ((start + range) - 1); i++) {
        if (i === currentPage) {
            paging.push(`[${i}]`); // add brackets to indicate current page 
        } else {
            paging.push(i.toString());
        }
    }
    return paging;
}

function renderPagination(r, p) {
    var pages = '';

    if (r.noOfPage > 0) {
        let currentPage = p, // input
            range = 10,  // amount of links displayed 
            totalPages = r.total, // determined by amount of items, hardcoded for readability 
            start = 0;  // default


        // Don't use negative values, force start at 1
        if (currentPage < (range / 2) + 1) {
            start = 0;

            // Don't go beyond the last page 
        } else if (currentPage >= (totalPages - (range / 2))) {
            start = Math.floor(totalPages - range + 1);

        } else {
            start = (currentPage - Math.floor(range / 2));
        }
        pages += '<nav aria-label=\"Page navigation pagination\">';
        pages += '<ul class=\"pagination justify-content-center\">';
        if ((p - 1) > 0) {
            ///console.log('previous enabled...');
            pages += '<li class=\"page-item\">';
        } else {
            //console.log('previous diabled...');
            pages += '<li class=\"page-item disabled\">';
        }

        pages += '<a class=\"page-link\" tabindex="-1">Previous</a>';
        pages += '</li>';

        var endIdx = ((start + range) - 1);
        if (endIdx > (r.noOfPage - 1)) {
            endIdx = (r.noOfPage - 1);
        }

        for (let i = start; i <= endIdx; i++) {
            if (i === currentPage) {
                pages += '<li class=\"page-item active\"><a class=\"page-link\" >' + i + '</a></li>';
            } else {
                pages += '<li class=\"page-item\"><a class=\"page-link\" >' + i + '</a></li>';
            }
        }

        ///
        if(p === r.noOfPage) {
            pages += '<li class=\"page-item disabled\">';
        } else {
            pages += '<li class=\"page-item\">';
        }
        
        pages += '<a class=\"page-link\" >Next</a>';
        pages += '</li>';
        pages += '</ul>';
        pages += '</nav>';
    }
    document.getElementById('pagination').innerHTML = pages;
    var lii = document.getElementById('pagination').getElementsByTagName('li');
    for (var i = 0; i < lii.length; i++) {
        lii[i].addEventListener('click', (e) => {
            linkClicked(e);
        })
    }
}

function performsearch(page) {
    document.getElementById('error').innerHTML = '';
    current = page;
    var query = document.getElementById('mini-search-input').value;
    //console.log('query =' + query);
    if (query === '' || query.length === 0) {
        document.getElementById('error').innerHTML = 'please enter a valid query'
        return;
    }
    document.getElementById('mini-head').innerHTML = mini_head;

    document.getElementById('mini-search-input').value = query;
    //console.log('search query...' + query);
    let result = mini.search(query, parseInt(page));
    totalNoOfPages = result.noOfPage;
    //console.log('response size...' + result.length);
    var rtime = 'About ' + result.total + ' resuls in - ' + result.time + ' seconds...'
    //console.log('rtime->' + rtime);
    document.getElementById('mini-results-response-time').innerHTML = rtime;
    var response = '';
    result.results.forEach(function (r) {
        if (typeof r !== 'undefined') {
            var title = r.title.substring(0, 50) + '...';
            response += '<div class=\"mini-result-row\"><div class=\"row\">';
            response += '<div class=\'column\'><div class=\"mini-result-img\"><img heigth=\'100px\' width=\'100px\' src=' + r.image + ' alt=' + r.title + '/></div></div>';
            response += '<div class=\'column\'>';
            response += '<div class=\"mini-result-src\"><a target=\'_blank\'href=\'' + r.id + '\'>' + r.id + '</a></div>';
            response += '<a target=\'_blank\'href=\'' + r.id + '\'>' + '<div class=\"mini-result-title\">' + title + '</div></a>';
            if (r.description !== "") {
                response += '<div class=\"mini-result-desc\">' + r.description.substring(0, 150) + '...' + '</div>';
            } else {
                response += '<div class=\"mini-result-desc\">' + r.description + '...' + '</div>';
            }

            response += '<div class=\"mini-result-meta\"> '
            response += renderMeta(r.aggregateRating.ratingValue, r.aggregateRating.reviewCount);
            response += '</div>';
            response += '</div></div></div><br>';
        }
    });

    renderPagination(result, parseInt(page));

    if (result.total === 0) {
        //console.log('no data' + result.total);
        document.getElementById('mini-results').innerHTML = '<span class=\"mini-error\">Sorry no results matching your criteria...</span>';

    } else {
        //console.log('no of results ' + result.total);
        document.getElementById('mini-results').innerHTML = response;
    }
    init();
}

function init() {
    try {
        //console.log(document.getElementById('mini-search-input'));
        document.getElementById('mini-search-input').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                //console.log('enter clicked...');
                event.preventDefault();
                performsearch(0);
                return;
            }
            document.getElementById('error').innerHTML = '';
        })
        document.getElementById('mini-btn-search').addEventListener('click', () => {
            performsearch(0);
        })
    } catch (e) {
        //console.log(e.stack);
        document.getElementById('error').innerHTML = e.message;
    }
}

init();