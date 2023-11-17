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
        url += `&amiiboSeries=${amiiboLineTerm}`; 
    }
    if(gameTerm.length >= 1){
        url += `&gameseries=${gameTerm}`;
    }
    
    url += `&type=${typeTerm}`;

    console.log(url);

    document.querySelector("#status").innerHTML = "Searching for Amiibo...";

    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET",url);
    xhr.send();
}

function dataError(e){
    console.log("Something went wrong.");
}

function dataLoaded(e){
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
    //console.log(obj);
    //console.log(obj.length);
    let amiibos = obj.amiibo;

    console.log(amiibos);

    if(amiibos == null || amiibos.length == 0){
        document.querySelector("#content").innerHTML = "No results.";
        document.querySelector("#status").innerHTML = "No amiibo found.";
        return;
    }

    document.querySelector("#content").innerHTML = "<p>Here are the results:</p>";

    let bigString = "";

    for(position in amiibos){
        let result = amiibos[position];
        bigString += `<div class = 'amiibo'><h3>${result.name}</h3>`;
        bigString += `<img src='${result.image}' title='${result.name}' />`;
        bigString += `<p>Amiibo Line: ${result.amiiboSeries}</p>`;
        bigString += `<p>Game Series: ${result.gameSeries}</p>`;
        bigString += `<h4>Release Dates:</h4><ul>`
        bigString += `<li>${presentReleaseDate(result.release.na, "NA")}</li>`;
        bigString += `<li>${presentReleaseDate(result.release.eu, "EU")}</li>`;
        bigString += `<li>${presentReleaseDate(result.release.jp, "JP")}</li>`;
        bigString += `<li>${presentReleaseDate(result.release.au, "AU")}</li></ul>`;
        bigString += `Type: ${result.type}</div>`;
    }

    document.querySelector("#content").innerHTML = bigString;

    document.querySelector("#status").innerHTML = "Amiibo found!";
}

function presentReleaseDate(date, location){
    if(date == null){
        return `${location}: N/A`;
    }
    else{
        return `${location}: ${date}`;
    }
}