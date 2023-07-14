const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const puppeteer = require('puppeteer');
app.use(express.static('public'));
const fs = require('fs');
const axios = require('axios');



//find movies at imdb
async function scrapeSite(url) {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');
    await page.goto(url, {waitUntil: 'networkidle0'});

    const content = await page.content();  // Get the whole HTML content of the page

    // Use regex to find what you need in the HTML content
    const regex = /"titleText":{"text":"(.*?)"/g;
    let matches;
    var allMatches = [];
    while ((matches = regex.exec(content)) !== null) {
        allMatches.push(matches[1]);  // matches[1] contains the captured group
    }

    if (allMatches.length > 0) {
        console.log(allMatches);
        console.log(typeof allMatches);
    } else {
        console.log('No matches found');
    }
    
    await browser.close();

    return allMatches;
}

scrapeSite('https://www.imdb.com/chart/boxoffice/?ref_=hm_cht_sm').then(allMatches => {
    let movie1 = allMatches[0]
    let movie2 = allMatches[1]
    let movie3 = allMatches[2]
    let movie4 = allMatches[3]
    let movie5 = allMatches[4]
    let movie6 = allMatches[5]
    let movie7 = allMatches[6]
    let movie8 = allMatches[7]
    let movie9 = allMatches[8]
    let movie10 = allMatches[9]
});

//IMDb rating: löytyy ratingittgtg


//what movie

let movie = "dune"


console.log(movie7)
let year = 2023

// find movie info from imdb

let runtime
let director
let plot
let rating


let myPromise = new Promise((resolve, reject) => {
axios.get('http://www.omdbapi.com/?t='+movie+'&y='+year, {
    params: {
        apikey: '15e8ed03'
        }
    })
    .then(response => {
        runtime = String(response.data.Runtime);
        director = String(response.data.Director);
        plot = String(response.data.Plot);
        rating = String(response.data.imdbRating);
        finished = true;

        
    })
    .catch(error => {
        console.error('Error:', error);
    });
    setTimeout(() => resolve(true), 3000); // resolve after 3 seconds
});


// favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(__dirname, './favicon.ico'));
});




// send movie info to userss
myPromise.then((value) => {
// print needed info
console.log(runtime, director, plot, rating)

const port2 = 5683;

let data = {
    runtime:runtime,
    director:director,
    plot:plot,
    rating:rating
    // any other data you want to sendd
};

    app.get('/getData', (req, res) => {
        
        res.json(data);
    });
    
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
      });
});