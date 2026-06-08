const canvas = document.getElementById(`Rain`);
const context = canvas.getContext(`2d`);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//matrix rain characters
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const digits = `0123456789`;
const alphabet = katakana + latin + digits;

const fontSize = 20;
const columns = canvas.width/fontSize;
const textColumns = Math.trunc((17.5/0.7)/0.6);

const rainDrops = [];

let numMovies = 0;

for (let i = 0; i < columns; i++){
    rainDrops[i] = 1;
}

drawGrid();
document.getElementById(`homepage`).style.display = "";

function drawGrid(){
    context.fillStyle = `#0F0`;
    context.font = fontSize + `px monospace`;
    for (let x = 0; x < columns; x++){
        for (let y = 0; y < canvas.height / fontSize; y++){
            context.fillRect(x * fontSize + 1, y * fontSize + 1, fontSize - 2, fontSize - 2);
        }
    }
    context.fillStyle = `rgba(20, 24, 28, 0.1)`;
    for (let i = 0; i < 500; i++){
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function digitalRain(){
    context.fillStyle = `rgba(20, 24, 28, 0.1)`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = `#0F0`;
    context.font = fontSize + `px monospace`;

    for (let i = 0; i < rainDrops.length; i++){
        const text = alphabet.charAt(Math.trunc(Math.random() * alphabet.length));
        context.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        if(rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975){
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

let alreadyPrinted = false;

const movieNames = [];
const links = [];
const releaseYears = [];
const initialWatchDates = [];
const starRatings = [];
const tmdbIds = [];

async function noUsername(){
    //do later
}

//called by generate
async function fetchMovies() {
    movieNames.length = 0;
    links.length = 0;
    releaseYears.length = 0;
    initialWatchDates.length = 0;
    starRatings.length = 0;
    tmdbIds.length = 0;

    const username = document.getElementById('username').value; //user input for username
    if (username == ""){
        noUsername(); //implement later
        return;
    }
    const rssfeed = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://letterboxd.com/${username}/rss/?random=${Math.trunc(Math.random()*50)}`)}`);
    const text = await rssfeed.text(); //converts data to text

    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(text, "text/xml"); //converts text to xml
    const items = xmlDocument.querySelectorAll("item");

    const lb = "https://letterboxd.com";

    const movieItems = [];
    for (const each of items){
        const title = each.getElementsByTagNameNS(lb, "filmTitle")[0];

        if (title){
            movieItems.push(each);        
            movieNames.push(title.textContent);
        }
    }

    if (movieItems.length < 1){
        console.log("No movies found.");
        return;
    }
    numMovies = movieItems.length;

    for (let i = 0; i < numMovies; i++){
        const each = movieItems[i];

        const link = each.getElementsByTagName("link")[0].textContent;
        //converts user-specific link to film link
        const httpsIndex = link.indexOf("https://") + 8;
        const firstSlash = link.indexOf("/", httpsIndex);
        const secondSlash = link.indexOf("/", firstSlash + 1);
        const thirdSlash = link.indexOf("/", secondSlash + 1);
        const fourthSlash = link.indexOf("/", thirdSlash + 1);
        links[i] = link.substring(0, firstSlash) + link.substring(secondSlash, fourthSlash + 1);
        
        releaseYears[i] = each.getElementsByTagNameNS(lb, "filmYear")[0].textContent;

        const tmdbId = each.getElementsByTagNameNS("https://themoviedb.org", "movieId")[0] ? 
            each.getElementsByTagNameNS("https://themoviedb.org", "movieId")[0].textContent: 
            each.getElementsByTagNameNS("https://themoviedb.org", "tvId")[0].textContent;
        tmdbIds[i] = tmdbId;

        const date = each.getElementsByTagNameNS(lb, "watchedDate")[0];
        //convert to date format
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        let watchedDate = new Date();
        if (date){
            watchedDate = new Date(date.textContent); //creates new Date object if watchedDate is in rss feed
        }
        initialWatchDates[i] = document.getElementById("date").innerText = watchedDate.toLocaleDateString('en-US', options);

        const rating = each.getElementsByTagNameNS(lb, "memberRating")[0] ? each.getElementsByTagNameNS(lb, "memberRating")[0].textContent : "No rating provided";
        //convert to star rating
        let stars = "";
        for (let j = 0; j < Math.trunc(rating); j++){
            stars += "★";
        }
        if (parseFloat(rating) % 1 == 0.5){
            stars += "½";
        }
        if (each.getElementsByTagNameNS(lb, "memberLike")[0].textContent == "Yes"){
            stars += " ❤︎";
        }
        if (stars == ""){
            starRatings[i] = "No rating";
        } else {
            starRatings[i] = stars;
        }
    }
    
    /*context.fillStyle = `rgba(0, 255, 0, 0.25)`;
    context.font = fontSize + `px monospace`;
    for (let x = 0; x < columns; x++){
        for (let y = 0; y < canvas.height / fontSize; y++){
            context.fillRect(x * fontSize + 1, y * fontSize + 1, fontSize - 2, fontSize - 2);
        }
    }*/

    const buttons = document.getElementsByClassName(`movieButton`);
    const count = Math.min(buttons.length, tmdbIds.length);

    document.querySelectorAll(`.movieButton`).forEach(
        function(eachFrame) {
            eachFrame.style.display = "none";
        }
    );

    for (let i = 0; i < count; i++){
        await getOptionPoster(tmdbIds[i], i + 1);
    }

    document.querySelectorAll(`.navButton`).forEach(function(element) {
        element.style.display = "block";
    })
    document.getElementById(`back`).style.display = "flex";
    document.getElementById(`homepage`).style.display = "none";
    document.getElementById(`page`).style.display = "block";
    document.getElementById(`options`).style.display = "flex";
    document.getElementById(`options2`).style.display = "none";
    //setInterval(digitalRain, 30);
}
//called by one of the options buttons
async function printReceipt(id){
    getPoster(id);
    await fetchOrderNumber();
    document.querySelectorAll(`.navButton`).forEach(function(element) {
        element.style.display = "none";
    })
    document.getElementById('options').style.display = "none";
    document.getElementById('options2').style.display = "none";
    document.getElementById(`secondPage`).style.display = "flex";
    document.getElementById(`receipt`).style.display = "flex";
    document.getElementById(`posterFrame`).style.display = "flex";
    document.getElementById('title').textContent = movieNames[id - 1];
    document.getElementById(`director`).textContent = "from director " + await getDirector(tmdbIds[id - 1]);
    document.getElementById(`runtime`).textContent = "runtime: " + await getRuntime(tmdbIds[id - 1]);

    /*let totalHeight = document.getElementById('title').clientHeight - 32;
    while (Math.round(totalHeight / 32.64) > 2){
        document.getElementById(`title`).style.fontSize = "" + (parseFloat(document.getElementById(`title`).style.fontSize) - 0.25) + "rem";
        console.log(document.getElementById(`title`).style.fontSize);
        totalHeight = document.getElementById('title').clientHeight - 32; 
    }*/

    document.getElementById(`date`).textContent = initialWatchDates[id - 1];
    document.getElementById('rating').textContent = "Rating: " + starRatings[id - 1];  
    document.getElementById(`orderNumber`).textContent = "Order #" + String(Math.trunc((Math.random() * 9999)) + 1).padStart(4,`0`);
    if (!alreadyPrinted){
        alreadyPrinted = true;
        printDividers();
    }
}
//called by back
function back(){
    if (document.getElementById(`secondPage`).style.display == "none"){
        document.getElementById(`page`).style.display = "none";
        document.getElementById(`homepage`).style.display = "flex";
        document.getElementById(`back`).style.display = "none";
        document.querySelectorAll(`.navButton`).forEach(function(element) {
            element.style.display = "none";
        })
    } else {
        document.getElementById(`secondPage`).style.display = "none";
        document.getElementById('options').style.display = "flex";
        document.querySelectorAll(`.navButton`).forEach(function(element) {
            element.style.display = "block";
        })
    }
}

//called by fetchMovies
async function getOptionPoster(id, slot) {
    const apiKey = "c6eb8cf5272fb52110935fea02047e95";
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/images?language=en&api_key=${apiKey}`);
    const data = await response.json();
    const filePath = data.posters[0].file_path;
    document.getElementById(`frame${slot}`).style.display = "flex";
    document.getElementById(`movie${slot}`).src = `https://image.tmdb.org/t/p/w500${filePath}`;
}
//called by printReceipt
function getPoster(slot){
    document.getElementById(`poster`).src = document.getElementById(`movie${slot}`).src;
}
async function printDividers(){
    const dividers = document.getElementsByClassName("divider");
    for (const divider of dividers){
        divider.innerText += "-".repeat(textColumns);
    }
}
async function getDirector(id){
    const apiKey = "c6eb8cf5272fb52110935fea02047e95";
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US&api_key=${apiKey}`)
    const data = await response.json();
    const directorName = data.crew.find(person => person.job === "Director").name;
    return directorName;
}
async function getRuntime(id){
    const apiKey = "c6eb8cf5272fb52110935fea02047e95";
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`)
    const data = await response.json();
    return Math.trunc(data.runtime/60) + "hr " + (data.runtime%60) + "min";
}
async function fetchOrderNumber(){
    const res = await fetch("https://new-piranha-128179.upstash.io/incr/receipt-counter", {
        headers: {Authorization: "Bearer gwAAAAAAAfSzAAIMQHAxcmVjZWlwdC11c2VyDSYoIw7ypTkOrG5ZBtrNsZhwYgWT63mT6DJqaC9W2zJKsO04diE2jTkCwp1TGCP64rh5rQoyj9_iSSQMgJbA3w"}
    });
    //const data = await res.json();
    //const orderNum = data.result;
    //document.getElementById(`number`).textContent = `#${String(orderNum).padStart(4, '0')}`;
}

async function changeOptions(){
    if (numMovies > 5){
        if (document.getElementById(`options`).style.display == "none"){
            document.getElementById(`options`).style.display = "flex";
            document.getElementById(`options2`).style.display = "none";
        } else {
            document.getElementById(`options`).style.display = "none";
            document.getElementById(`options2`).style.display = "flex";
        }
    }
}