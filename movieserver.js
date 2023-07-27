const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const puppeteer = require('puppeteer');
app.use(express.static('public'));
const fs = require('fs');
const axios = require('axios');

process.setMaxListeners(20);

// favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(__dirname, './favicon.ico'));
});

allMatches = [];
let year = 2023
content = ""
url = 'https://www.fandango.com/movies-in-theaters'


async function everything() {

// etsii fandangosta leffalistan
while (allMatches.length < 1) {
    console.log("searching...")
    let browser = await puppeteer.launch({
        headless: "new" 
    });
    let page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');
    await page.goto(url, {waitUntil: 'networkidle0'});

    content = await page.content();  // Get the whole HTML content of the page

    // Use regex to find what you need in the HTML content
    const regex = /title" aria-hidden="true">(.*?)\(/g;
    let match;
    while ((match = regex.exec(content)) !== null && allMatches.length < 10) {
        allMatches.push(match[1]);
    }
    await browser.close();
}

re_runtime = ""
re_director = ""
re_plot = ""
re_rating = ""
re_poster = ""
re_score = ""

// tämä tehdään jokaiselle elokuvalle erikseen
async function findInfo(movie) {
    // etsii tiedot
    try {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                t: movie,
                y: year, 
                apikey: '15e8ed03'
            }
        });

        re_runtime = String(response.data.Runtime);
        re_director = String(response.data.Director);
        re_plot = String(response.data.Plot);
        re_rating = String(response.data.imdbRating);
        
    } catch (error) {
        console.error('Error:', error);
    }

    // etsii julisteen
    try {
        const response2 = await axios.get('https://api.themoviedb.org/3/search/movie?api_key=a11375df0e085d0b5ac37b8daa5aea27&query=' + movie, {
            params: {
            }
        });
        re_poster = "https://image.tmdb.org/t/p/w500" + String(response2.data.results[0].poster_path)
        
    } catch (error) {
        console.error('Error:', error);
    }

    // etsi elokuvan imdb-url
    let browser;
    try {
        let browser = await puppeteer.launch({
            headless: "new"
        });
        let page = await browser.newPage();
        let baseUrl = 'https://www.google.com/search';
        let query = `${movie} IMDb`;
        let encodedQuery = encodeURIComponent(query);
        let url2 = `${baseUrl}?q=${encodedQuery}&btnI`;
        await page.goto(url2);
        // Get the URL of the resulting page
        imdbUrl = page.url();
    } catch (err) {
        console.error(err);
    } finally {
        if (browser) {
            browser.close();
        }
    }
    let regex = /=(.*)/;
    let match6 = imdbUrl.match(regex);
    let okImdbUrl = (match6[1]);
    
    console.log(okImdbUrl)
    let browser2 = await puppeteer.launch();
    let page2 = await browser2.newPage();

    await page2.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');
    await page2.goto(okImdbUrl, {waitUntil: 'networkidle0'});

    content2 = await page2.content();  // Get the whole HTML content of the page
    await browser2.close();

    // etsi imdb-score
    const regex3 = /"ratingValue":\s*([\d.]+)/g;
    let match3;
    allMatches2 = [];
    while ((match3 = regex3.exec(content2)) !== null) {
        allMatches2.push(match3[1]);
    }
    
    console.log(allMatches2)
    re_score = allMatches2[1];
    
    let results = [re_runtime, re_director, re_plot, re_rating, re_poster, re_score];
    return results;
}

// aktivoidaan yllä oleva funktio ja annetaan sen arvo muuttujaan
let movie1info = await findInfo(allMatches[0])
let movie2info = await findInfo(allMatches[1]) 
let movie3info = await findInfo(allMatches[2]) 
let movie4info = await findInfo(allMatches[3]) 
let movie5info = await findInfo(allMatches[4]) 
let movie6info = await findInfo(allMatches[5]) 
let movie7info = await findInfo(allMatches[6]) 
let movie8info = await findInfo(allMatches[7]) 
let movie9info = await findInfo(allMatches[8]) 
let movie10info = await findInfo(allMatches[9])  


class movies {

    constructor(name, runtime, director, plot, rating, poster, score){
        this.name = name
        this.runtime = runtime
        this.director = director
        this.plot = plot
        this.rating = rating
        this.poster = poster
        this.score = score
    }
}

// luodaan objectit elokuvista class movies mukaan
let movie1 = new movies(allMatches[0], movie1info[0], movie1info[1], movie1info[2], movie1info[3], movie1info[4], movie1info[5])
let movie2 = new movies(allMatches[1], movie2info[0], movie2info[1], movie2info[2], movie2info[3], movie2info[4], movie2info[5])
let movie3 = new movies(allMatches[2], movie3info[0], movie3info[1], movie3info[2], movie3info[3], movie3info[4], movie3info[5])
let movie4 = new movies(allMatches[3], movie4info[0], movie4info[1], movie4info[2], movie4info[3], movie4info[4], movie4info[5])
let movie5 = new movies(allMatches[4], movie5info[0], movie5info[1], movie5info[2], movie5info[3], movie5info[4], movie5info[5])
let movie6 = new movies(allMatches[5], movie6info[0], movie6info[1], movie6info[2], movie6info[3], movie6info[4], movie6info[5])
let movie7 = new movies(allMatches[6], movie7info[0], movie7info[1], movie7info[2], movie7info[3], movie7info[4], movie7info[5])
let movie8 = new movies(allMatches[7], movie8info[0], movie8info[1], movie8info[2], movie8info[3], movie8info[4], movie8info[5])
let movie9 = new movies(allMatches[8], movie9info[0], movie9info[1], movie9info[2], movie9info[3], movie9info[4], movie9info[5])
let movie10 = new movies(allMatches[9], movie10info[0], movie10info[1], movie10info[2], movie10info[3], movie10info[4], movie10info[5])

allmovies = [movie1, movie2, movie3, movie4, movie5, movie6, movie7, movie8, movie9, movie10]

// lähetetään data frontendiin
    app.get('/getData', (req, res) => {
        
        res.json(allmovies);
    });
    
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
      });

}
// laittamalla koko koodi funktioon voidaan käyttää await
everything()