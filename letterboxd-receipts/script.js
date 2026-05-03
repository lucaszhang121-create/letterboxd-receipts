/*Add flask + python backend later*/
async function fetchMovies() {
    const username = document.getElementById('username').value;
    const rssfeed = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://letterboxd.com/${username}/rss/`)}`);
    const text = await rssfeed.text();
    console.log(text);
}