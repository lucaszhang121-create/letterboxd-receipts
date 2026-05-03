/*Add flask+python backend later*/
async function fetchMovies() {
    const username = document.getElementById('username').value;
    const rssfeed = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://letterboxd.com/${username}/rss/`)}`);
    const text = await rssfeed.text();

    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(text, "text/xml");
    const items = xmlDocument.querySelectorAll("item");
    const link = "https://letterboxd.com";
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
    }
}