const express = require('express');
const path = require('path');
const cors = require('cors');
const port = 3000;
const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
process.setMaxListeners(100);
const readline = require('readline');
const http = require('http');
const { Server } = require('socket.io');
const { Console } = require('console');

const app = express();
const app2 = express();
app.use(cors());
app2.use(cors());
app.options('*', cors());
app2.options('*', cors());
app.use(express.static('public'));
const server = http.createServer(app);  // Create an HTTP server using Express
const io = new Server(server, {
    cors: {
        origin: "*",  // this would allow all origins, but you can specify a list instead for security
        methods: ["GET", "POST"]
    }
});

// tämä testausta varen, ettei tarvitse odotella
findmovies = true

// favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(__dirname, './favicon.ico'));
});

allMatches = [];
let year = 2023
content = ""
url = 'https://editorial.rottentomatoes.com/guide/popular-movies/'

// html hakemis funktio
async function fetchHTML(urls) {
    const htmlContents = await Promise.all(
        urls.map(url => 
            axios.get(url).then(response => response.data)
        )
    );

    return htmlContents;
}

tries = 0
async function everything() {

if (findmovies == true) {
// etsii rotten tomatoesista leffalistan
while (allMatches.length < 1 && tries < 1) {
    tries++
    console.log("searching...")
    let browser = await puppeteer.launch({
        headless: "true"
    });
    let page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');
    await page.goto(url, {waitUntil: 'networkidle0'});

    content = await page.content(); 
    const regex = />([^<]*?)<\/a>\s*<span class="subtle start-year"/g;
    let match;
    while ((match = regex.exec(content)) !== null && allMatches.length < 15) {
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
re_imdb = ""
re_finnkino = ""
re_trailer = ""
re_writers = ""
re_stars = ""

numbers = 15
function convertMinToHours(min) {
    var hours = Math.floor(min / 60);
    var minutes = min % 60;
    return hours + "h " + minutes + "m";
}

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

        re_writers = String(response.data.Writers);
        re_stars = String(response.data.Actors);

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
    console.log(re_poster)
    // etsi googlesta elokuvan imdb-linkki
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
        imdbUrl = page.url();

        let regex = /=(.*)/;
        let match6 = imdbUrl.match(regex);
        okImdbUrl = (match6[1]);
        re_imdb = okImdbUrl

        // yt trailer linkin haku
        let page2 = await browser.newPage();
        let baseUrl2 = 'https://www.google.com/search';
        let query2 = `${movie} trailer youtube`;
        let encodedQuery2 = encodeURIComponent(query2);
        let url22 = `${baseUrl2}?q=${encodedQuery2}&btnI`;
        await page2.goto(url22);
        YTUrl = page2.url();
        re_trailer = YTUrl
        console.log(YTUrl)

        //finnkino linkki
        let page3 = await browser.newPage();
        let baseUrl3 = 'https://www.google.com/search';
        let query3 = `${movie} finnkino`;
        let encodedQuery3 = encodeURIComponent(query3);
        let url23 = `${baseUrl3}?q=${encodedQuery3}&btnI`;
        await page3.goto(url23);
        FINurl = page3.url();

        let regexFIN = /=(.*)/;
        let matchFIN = FINurl.match(regexFIN);
        let okFINurl = (matchFIN[1]);
        re_finnkino = okFINurl
        console.log(okFINurl)

        
    } catch (err) {
        console.error(err);
    } finally {
        if (browser) {
            browser.close();
        }
    }
    

    
    // kun imdb-url on loytynyt haetaan elokuvan imdb-sivulta score
    console.log(okImdbUrl)
    let browser2 = await puppeteer.launch();
    let page2 = await browser2.newPage();

    await page2.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');
    await page2.goto(okImdbUrl, {waitUntil: 'networkidle0'});

    content2 = await page2.content();
    await browser2.close();

    // etsi imdb-score
    const regex3 = /"ratingValue":\s*([\d.]+)/g;
    let match3;
    allMatches2 = [];
    while ((match3 = regex3.exec(content2)) !== null) {
        allMatches2.push(match3[1]);
    }
    re_score = allMatches2[1];

    // etsi runtime
    const regexRuntime = /og:description" content="(.*?)\|/;
    let match3run = content2.match(regexRuntime);;
    
    console.log(match3run[1])
    if (match3run[1].length > 7) {
        match3run[1] = "?"
    }
    re_runtime = match3run[1]

    // etsi ohjaaja
    const regexDir = /Directed by (.*?)\./;
    let match3Dir = content2.match(regexDir);;
    
    console.log(match3Dir[1])
    re_director = match3Dir[1]

    // etsi plot
    const regexPlot = /(?<={"plotText":{"plainText":")[^"]*(?=")/;
    let match3Plot = content2.match(regexPlot);;
    
    console.log(match3Plot[0])
    re_plot = match3Plot[0]

    // etsi kirjoittajat
    

    console.log(numbers)
    numbers = numbers-1
    let results = [re_runtime, re_director, re_plot, re_rating, re_poster, re_imdb, re_score, re_finnkino, re_trailer, re_writers, re_stars];
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
let movie11info = await findInfo(allMatches[10])
let movie12info = await findInfo(allMatches[11])
let movie13info = await findInfo(allMatches[12])
let movie14info = await findInfo(allMatches[13])
let movie15info = await findInfo(allMatches[14])
  


class movies {

    constructor(name, runtime, director, plot, rating, poster, imdb, score, finnkino, trailer, writers, stars){
        this.name = name
        this.runtime = runtime
        this.director = director
        this.plot = plot
        this.rating = rating
        this.poster = poster
        this.imdb = imdb
        this.score = score
        this.finnkino = finnkino
        this.writers = writers
        this.stars = stars
        this.trailer = trailer
    }
}

// luodaan objectit elokuvista class movies mukaan
let movie1 = new movies(allMatches[0], movie1info[0], movie1info[1], movie1info[2], movie1info[3], movie1info[4], movie1info[5], movie1info[6], movie1info[7], movie1info[8], movie1info[9], movie1info[10])
let movie2 = new movies(allMatches[1], movie2info[0], movie2info[1], movie2info[2], movie2info[3], movie2info[4], movie2info[5], movie2info[6], movie2info[7], movie2info[8], movie2info[9], movie2info[10])
let movie3 = new movies(allMatches[2], movie3info[0], movie3info[1], movie3info[2], movie3info[3], movie3info[4], movie3info[5], movie3info[6], movie3info[7], movie3info[8], movie3info[9], movie3info[10])
let movie4 = new movies(allMatches[3], movie4info[0], movie4info[1], movie4info[2], movie4info[3], movie4info[4], movie4info[5], movie4info[6], movie4info[7], movie4info[8], movie4info[9], movie4info[10])
let movie5 = new movies(allMatches[4], movie5info[0], movie5info[1], movie5info[2], movie5info[3], movie5info[4], movie5info[5], movie5info[6], movie5info[7], movie5info[8], movie5info[9], movie5info[10])
let movie6 = new movies(allMatches[5], movie6info[0], movie6info[1], movie6info[2], movie6info[3], movie6info[4], movie6info[5], movie6info[6], movie6info[7], movie6info[8], movie6info[9], movie6info[10])
let movie7 = new movies(allMatches[6], movie7info[0], movie7info[1], movie7info[2], movie7info[3], movie7info[4], movie7info[5], movie7info[6], movie7info[7], movie7info[8], movie7info[9], movie7info[10])
let movie8 = new movies(allMatches[7], movie8info[0], movie8info[1], movie8info[2], movie8info[3], movie8info[4], movie8info[5], movie8info[6], movie8info[7], movie8info[8], movie8info[9], movie8info[10])
let movie9 = new movies(allMatches[8], movie9info[0], movie9info[1], movie9info[2], movie9info[3], movie9info[4], movie9info[5], movie9info[6], movie8info[7], movie9info[8], movie9info[9], movie9info[10])
let movie10 = new movies(allMatches[9], movie10info[0], movie10info[1], movie10info[2], movie10info[3], movie10info[4], movie10info[5], movie10info[6], movie10info[7], movie10info[8], movie10info[9], movie10info[10])
let movie11 = new movies(allMatches[10], movie11info[0], movie11info[1], movie11info[2], movie11info[3], movie11info[4], movie11info[5], movie11info[6], movie11info[7], movie11info[8], movie11info[9], movie11info[10])
let movie12 = new movies(allMatches[11], movie12info[0], movie12info[1], movie12info[2], movie12info[3], movie12info[4], movie12info[5], movie12info[6], movie12info[7], movie12info[8], movie12info[9], movie12info[10])
let movie13 = new movies(allMatches[12], movie13info[0], movie13info[1], movie13info[2], movie13info[3], movie13info[4], movie13info[5], movie13info[6], movie13info[7], movie13info[8], movie13info[9], movie13info[10])
let movie14 = new movies(allMatches[13], movie14info[0], movie14info[1], movie14info[2], movie14info[3], movie14info[4], movie14info[5], movie14info[6], movie14info[7], movie14info[8], movie14info[9], movie14info[10])
let movie15 = new movies(allMatches[14], movie15info[0], movie15info[1], movie15info[2], movie15info[3], movie15info[4], movie15info[5], movie15info[6], movie15info[7], movie15info[8], movie15info[9], movie15info[10])

console.log(movie11, movie12, movie13, movie14, movie15)

allmovies = [movie1, movie2, movie3, movie4, movie5, movie6, movie7, movie8, movie9, movie10, movie11, movie12, movie13, movie14, movie15]
}

// tämä testausta varen, ettei tarvitse odotella
if (!findmovies) {
    allMatches = []
    allmovies = []
    for (let i=0; i<=16; i++) {
        allMatches.push("Aa a")
        allmovies.push("Aa a")
    }
}

// lähetetään html sivut clientille
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/theaters.html');
  });
  
  for(let i = 0; i <= 14; i++) {
    app.get('/' + allMatches[i].replace(/ /g, "-").toLowerCase(), (req, res) => {
      res.sendFile(__dirname + '/public/movieInfo.html');
    });
  };

app.get('/games', (req, res) => {
    res.sendFile(__dirname + '/public/games.html');
  });

  app.get('/memory-game', (req, res) => {
    res.sendFile(__dirname + '/public/memoryGame.html');
  });


// leffadatan lähetys
app.get('/getData', (req, res) => {
        
    res.json(allmovies);
});
    


// vastaanotetaan dataa clientistä
app.use(express.json());
receivedData = "" 
app.post('/add_movies', (req, res) => {
    let receivedData = req.body.data;
    console.log(receivedData);
    
    const fs = require('fs');
    const path = 'movies.json';
    
    // Load existing data
    const jsonData = JSON.parse(fs.readFileSync(path, 'utf8'));
    
    if (jsonData.movies.includes(receivedData)) {
        //respond to to user
        return res.send('Already here!');
    }
    else {
        // Add new data
    jsonData.movies.push(receivedData);

    // Write updated data back to the file
    fs.writeFileSync(path, JSON.stringify(jsonData, null, 2));
    }

    
    
  });


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


// luodaan leffalista muistipeliä varten
moviesC = []
// uudet leffat
for (let i = 0; i <= 12; i++) {
    moviesC.push(allmovies[i])
    moviesC.push(allmovies[i])
}
// omat leffat (chat-gpt)
// Read the JSON file
fs.readFile('movies.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    const data = JSON.parse(jsonString);

    // Fisher-Yates (aka Durstenfeld) array shuffling algorithm
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    const shuffledMovies = shuffle(data.movies);
    const randomMovies = shuffledMovies.slice(0, 6);

    for (let i = 0; i <= 5; i++) {
        //moviesC.push(randomMovies[i])
        //moviesC.push(randomMovies[i])
    }
    
    
    //console.log(moviesC)
});

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
  shuffleArray(moviesC);


// muistipeli
function randomNumber(){
    var randomNumber = Math.floor(Math.random() * 1000);
    return randomNumber;
}
function randomNumber2(){
    const randomBool = Math.random() >= 0.5;
    if (randomBool <= 0.5) {
        return false;
    }
    else {
        return true;
    }
    
}
servers = []
Servernumber = 0
roomNumber = 1
// kuunnellaan käskyä aloittaa peli    
app.post('/start_memory_game', (req, res) => {
    let receivedData = req.body.data;
    console.log(receivedData);

    // kun frontista tulee viesti niin palvelin käynnistää kaksi sivua
    if (receivedData == "start") {
        let random = randomNumber()  
        Servernumber = Servernumber + random

        app.get('/' + String(Servernumber) + '/player1', (req, res) => {
            res.sendFile(__dirname + '/public/memoryGamePlayer1.html');
        });
        app.get('/' + String(Servernumber) + '/player2', (req, res) => {
            res.sendFile(__dirname + '/public/memoryGamePlayer2.html');
        });
        res.send(String(Servernumber) + '/player1');

    }
});



io.on('connection', (socket) => {

    // luodaan room tälle multiplayer-pelille
    socket.on('join-room', (Servernumber) => {
        

        // katsotaan onko
        let room = io.sockets.adapter.rooms.get(Servernumber);
        let roomSize = room ? room.size : 0; 
        let player1Starts = false
        if (roomSize == 2) {
            console.log(Servernumber + ' is full')
            socket.emit('message', 'room is full');
        }

        if (roomSize < 2 ) {
            socket.join(Servernumber);
            console.log('User ' + socket.id + ' joined room: ' + Servernumber);
            socket.emit('message', 'joined room');

            let room = io.sockets.adapter.rooms.get(Servernumber);
            let roomSize = room ? room.size : 0;
            if (roomSize == 2) {
                let random69 = randomNumber2()
                if (random69 == true) {
                    player1Starts = true
                }
                
                io.to(Servernumber).emit('message', moviesC);
                // määrätään kumman vuoro aloittaa
                if (player1Starts) {
                    io.to(Servernumber).emit('message', 'Player1 turn');
                }
                if (!player1Starts) {
                    io.to(Servernumber).emit('message', 'Player2 turn');
                }
            }
            // vastaanottaa viestejä ja lähettää ne eteenpäin
            socket.on('send-message', (room, message) => {
            
                io.to(Servernumber).emit('message', message);
                console.log(message)
                regexClick1 = /^Player1click (\d+)$/;
                regexClick2 = /^Player2click (\d+)$/;
                let Player1Clicks = 0
                let Player2Clicks = 0

                

            // vaihdetaan pelivuoroja kahden klikin jälkeen
            if (message.match(regexClick1)) {
                Player1Clicks++
            }
            if (message.match(regexClick2)) {
                Player2Clicks++
            }
            if (Player1Clicks == 2) {
                io.to(Servernumber).emit('message', 'Player2 turn');
            }
            if (Player2Clicks == 2) {
                io.to(Servernumber).emit('message', 'Player1 turn');
            }
            
            });
            

        }

        

            
               // console.log('User ' + socket.id + ' joined room: ' + Servernumber);
                //socket.join(Servernumber);
                //let random69 = randomNumber2()

                //if (random69 == true) {
                 //   io.to(Servernumber).emit('message', 'Player1 starts');
                //}
                //else {
                //io.to(Servernumber).emit('message', 'Player2 starts');
               // }
            
        
       
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(7926, () => {
    console.log('listening on port:7926');
});

let dipadupa = 'joo123'
// luodaan socket johon voidaan yhdistää


  // <-- Added the missing closing bracket and parenthesis here.







// kirjoitetaan dataa movies.json tiedostoon


// luetaan dataa
// npm install express body-parser
//let jsonData2 = fs.readFileSync('movies.json');
//let movieList = JSON.parse(jsonData);

//function getRandomElement(array) {
 //   return array[Math.floor(Math.random() * array.length)];
//}

//for (let i=0; i<=3; i++){
 //   console.log(getRandomElement(movieList));
//}

}
// laittamalla koko koodi funktioon voidaan käyttää await
everything()