window.onload = (e) => {document.querySelector("#search").onclick = getData};

function getData(){
    const AMIIBO_URL = "https://www.amiiboapi.com/api/amiibo/?";

    let url = AMIIBO_URL;

    let nameTerm = document.querySelector("#namesearch").value.trim();
    nameTerm = encodeURIComponent(nameTerm);

    let amiiboLineTerm = document.querySelector("#linesearch").value.trim();
    amiiboLineTerm = encodeURIComponent(amiiboLineTerm);

    let gameTerm = document.querySelector("#gamesearch").value.trim();
    gameTerm = encodeURIComponent(gameTerm);

    let typeTerm = document.querySelector("#amiibotype").value.trim();
    typeTerm = encodeURIComponent(typeTerm);

    if(nameTerm.length >= 1){
        url += `&name=${nameTerm}`;
    }
    if(amiiboLineTerm.length >= 1){
        url += `&amiiboseries=${amiiboLineTerm}`; 
    }
    if(gameTerm.length >= 1){
        url += `&gameseries=${gameTerm}`;
    }
    
    url += `&type=${typeTerm}`;

    document.querySelector("#status").innerHTML = "Searching for Amiibo...";

    //let xhr = new XMLHttpRequest();
    //xhr.onload = dataLoaded;
    //xhr.onerror = dataError;
    //xhr.open("GET",url);
    //xhr.send();
}