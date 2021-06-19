# MiNi - a light weight search engine
 
![](https://rkumar-bengaluru.github.io/mini/images/mini-ask.webp) a lightweight search engine library for your website. Download and generate indexes for your website using the sitemap and use the index file for searching within your website.

## Want to see it in action

Click the Demo Link **[DEMO LINK](https://rkumar-bengaluru.github.io/mini/)**

## How to generate the website index
```
git clonse https://github.com/rkumar-bengaluru/mini
```
```
npm run build
```
### Site Data Preparation Stage
```
npm run index
```
This will start the command line process as below:-

![](https://rkumar-bengaluru.github.io/mini/images/mini-ask.webp)

Enter the website sitemap.xml file location, thiss will initiate the data preparation for the website in question. Below you can monitor the progress of the data preparation stage. This might take few minutes to hours depending on the number of the pages of your site.

![](https://rkumar-bengaluru.github.io/mini/images/min-progress.webp)

### Site Indexing Stage
 ```javascript
const  runSiteIndex = async () => {
	const urltoindex = 'https://www.yoursite.com/sitemap.xml';
	var options = { url:  urltoindex };
	var mini = new MiNi(options);
	mini.createIndexForSite('dir-to-keep-generated-index');
}
runSiteIndex();
```
### Search Integration Stage (Frontend - Web Browser)
```javascript
import  MiNiWeb  from  './mini/miniweb';
let  mini = new  MiNiWeb();

function yourSearchFunction() {
	let  result = mini.search(query);
	console.log(result);
	// use this the way you want with your website css
	// and other methods of your project. Enjoy :)!
}
```

### Search Integration Stage (Backend - Node JS)
```javascript
const  MiNi = require('./mini');
let  mini = new  MiNiWeb();

const  searchSite = async () => {
	const indexedUrl = 'https://www.yoursite.com/sitemap.xml';
	var options = { url:  indexedUrl, loadIndex:  true };
	var mini = new  MiNi(options);
	var result = mini.search('search-query');
	console.log(result);
}
```
### Sample Search Result JSON :
```json
[
	{
		"id" : "https://www.yoursite.com/product/YourMatchingProductId-01",
		"title" : "Your Webpage Title On this Page",
		"description" : "Your Webpage Description On this Page",
		"aggregateRating" : 		{
			"@type" : "AggregateRating",
			"ratingValue" : "4.3",
			"ratingCount" : 3,
			"reviewCount" : 2
		},
		"image" : "https://www.yoursite.com/images/product01.jpg"
	},
	{
		"id" : "https://www.yoursite.com/product/YourMatchingProductId-02",
		"title" : "Your Webpage Title On this Page",
		"description" : "Your Webpage Description On this Page",
		"aggregateRating" : 		{
			"@type" : "AggregateRating",
			"ratingValue" : 4.5,
			"ratingCount" : 2,
			"reviewCount" : 2
		},
		"image" : "https://www.yoursite.com/images/product01.jpg"
	},
    {
        // more results...
    } 
]
```
