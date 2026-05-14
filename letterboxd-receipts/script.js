const canvas = document.getElementById(`Rain`);
const context = canvas.getContext(`2d`);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//matrix rain characters
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const digits = `0123456789`;
const alphabet = katakana + latin + digits;

const fontSize = 16;
const columns = canvas.width/fontSize;
const textColumns = Math.trunc((17.5/0.7)/0.6);

const rainDrops = [];

for (let i = 0; i < columns; i++){
    rainDrops[i] = 1;
}

const drawBackground = () => {
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

//matrix rain effect
const draw = () => {
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

drawBackground();
document.getElementById(`homepage`).style.display = "";

async function fetchMovies() {
    const username = document.getElementById('username').value;
    const rssfeed = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://letterboxd.com/${username}/rss/`)}`);        const text = await rssfeed.text();

    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(text, "text/xml");
    const items = xmlDocument.querySelectorAll("item");
    const link = "https://letterboxd.com";
    const dateTest = items[0];

    let alreadyRun = false;
    //testing the items
    for (const each of items){
        const title = each.getElementsByTagNameNS(link, "filmTitle")[0];
        if (title == null) continue;
        const year = each.getElementsByTagNameNS(link, "filmYear")[0];
        const date = each.getElementsByTagNameNS(link, "watchedDate")[0];
            
        const rating = each.getElementsByTagNameNS(link, "memberRating")[0] ? each.getElementsByTagNameNS(link, "memberRating")[0].textContent : "No rating provided";
        let stars = "";
        if (rating){
            for (let i = 0; i < Math.trunc(rating); i++){
                stars += "★";
            }
            parseFloat(rating) % 1 == 0.5 ? stars += "½" : "";
        }
        console.log(
            title.textContent, 
            year.textContent, 
            date ? date.textContent : "No date provided", 
            stars
        );
        if (!alreadyRun){
            alreadyRun = true;
            document.getElementById('title').textContent += title.textContent;
            document.getElementById('rating').textContent += stars;
        }
    }
        
    const watchedDate = dateTest.getElementsByTagNameNS(link, "watchedDate")[0].textContent;
    if (watchedDate != null){ //change to if you have a watchedDate
        const date = new Date(watchedDate);
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        };
        document.getElementById("date").innerText = date.toLocaleDateString('en-US', options);
    } else {
        const date = new Date();
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        };
        document.getElementById("date").innerText = date.toLocaleDateString('en-US', options);
    }
    
    context.fillStyle = `rgba(0, 255, 0, 0.25)`;
    context.font = fontSize + `px monospace`;
    for (let x = 0; x < columns; x++){
        for (let y = 0; y < canvas.height / fontSize; y++){
            context.fillRect(x * fontSize + 1, y * fontSize + 1, fontSize - 2, fontSize - 2);
        }
    }
        
    document.getElementById(`homepage`).style.display = "none";
    document.getElementById(`receipt`).style.display = "flex";

    const dividers = document.getElementsByClassName("divider");
    for (const divider of dividers){
        divider.innerText += "-".repeat(textColumns);
    }

    setInterval(draw, 30);
}