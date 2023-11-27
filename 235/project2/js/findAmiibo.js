//The window will launch the setup() method when the window loads.
window.onload = setup;

//Establishing the names of the keys for storing information in the browser.
const prefix = "bjp2987-";
const nameKey = prefix + "name"
const amiiboLineKey = prefix + "amiiboLine"
const gameSeriesKey = prefix + "gameSeries";
const typeKey = prefix + "typeKey";
    
// grab the stored data, will return `null` if the user has never been to this page
const storedName = localStorage.getItem(nameKey);
const storedAmiiboLine = localStorage.getItem(amiiboLineKey);
const storedGameSeries = localStorage.getItem(gameSeriesKey);
const storedType = localStorage.getItem(typeKey);

//Applies the stored search from the browser into the respective fields/dropdown boxes from the HTML document.
//Additionally, it establishes an onclick event for the search button which starts the method getData when it gets clicked on.
function setup(){
    if (storedName){
    	//The storedName gets passed into the method formatSearch(), and then the result of that method gets returned and sent to the Name searchbar.
        //Same idea with the next 2.
        document.querySelector("#namesearch").value = formatSearch(storedName);
    }
    
    if (storedAmiiboLine){
    	document.querySelector("#linesearch").value = formatSearch(storedAmiiboLine);
    }
    
    if(storedGameSeries){
        document.querySelector("#gamesearch").value = formatSearch(storedGameSeries);
    }
    
    if(storedType){
        document.querySelector("#amiibotype").value = storedType;
    }
    
    document.querySelector("#search").onclick = getData;
}

//This method recieives a string, and then returns a version of that string where
//all instances of "%20" are replaced with " ".
//This method is used because the cookies in the browser replace space characters with "%20".
//This method returns the string with spaces so that it can be sent to one of the search bars in the HTML properly.
function formatSearch(search){
    let space = "%20";
    let newString = search;
    while (newString.indexOf(space) != -1){
        let temp = newString.indexOf(space);
        newString = newString.substring(0, temp) + " " + newString.substring(temp+3);
    }
    return newString;
}

//Here is where we get ready to send a request to AmiiboAPI to make a search.
function getData(){
    //This is the baseline url that must be used in order to send a request.
    const AMIIBO_URL = "https://www.amiiboapi.com/api/amiibo/?";

    //The url variable is where we will be storing our search.
    let url = AMIIBO_URL;

    //nameTerm contains the value of the Name search bar.
    //This is the name of the Amiibo figure.
    let nameTerm = document.querySelector("#namesearch").value.trim();
    nameTerm = encodeURIComponent(nameTerm);
    //Storing the user's chosen name into the nameKey key in the browser.
    localStorage.setItem(nameKey, nameTerm);

    //amiiboLineTerm contains the value of the Amiibo Line search bar.
    //Extra whitespace at the beginning and end is removed.
    //This is the name of the line/series the amiibo is part of.
    let amiiboLineTerm = document.querySelector("#linesearch").value.trim();
    amiiboLineTerm = encodeURIComponent(amiiboLineTerm);
    localStorage.setItem(amiiboLineKey,  amiiboLineTerm);

    //gameTerm contains the value of the Game Series search bar.
    //This is the name of the game/game series the character of the amiibo comes from.
    let gameTerm = document.querySelector("#gamesearch").value.trim();
    gameTerm = encodeURIComponent(gameTerm);
    localStorage.setItem(gameSeriesKey, gameTerm);

    //typeTerm contains the value of the currently selected option of the Type drop-down.
    //This is the name of the type of amiibo this one is, such as figure or card.
    let typeTerm = document.querySelector("#amiibotype").value.trim();
    typeTerm = encodeURIComponent(typeTerm);
    localStorage.setItem(typeKey, typeTerm);

    //If any of the 3 search terms have anything in them, we add the right term and the phrase searched into the url.
    //The API allows for you to put & before any term, even if it's the first one.
    if(nameTerm.length >= 1){
        url += `&name=${nameTerm}`;
    }
    if(amiiboLineTerm.length >= 1){
        url += `&amiiboSeries=${amiiboLineTerm}`; 
    }
    if(gameTerm.length >= 1){
        url += `&gameseries=${gameTerm}`;
    }

    //Here, we add the type of amiibo the user wants to search for.
    //However, if the user selected "All" in the type drop-down,
    //then we don't even include the type parameter because the user wants all of them.
    if(typeTerm != "all"){
        url += `&type=${typeTerm}`;
    }

    //Letting the user know that the program is searching.
    document.querySelector("#status").innerHTML = "Searching for Amiibo...";

    //We send a request to AmiiboAPI.
    //This part is basically the same as various examples given to us.
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET",url);
    xhr.send();
}

//This function gets called if an error happens while trying to send a request to AmiiboAPI.
//If there is an error, the status div says that something went wrong.
function dataError(e){
    document.querySelector("#status").innerHTML = "Something went wrong.";
}

//This method starts when we recieve information from AmiiboAPI.
function dataLoaded(e){
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    //This array contains every amiibo object recieved from the JSON file.
    let amiibos = obj.amiibo;

    //If the array is null or the length of the results is 0,
    //then the user is informed that nothing was found.
    //We also return so that the rest of this method does not occur.
    if(amiibos == null || amiibos.length == 0){
        document.querySelector("#content").innerHTML = "No results.";
        document.querySelector("#status").innerHTML = "No amiibo found.";
        return;
    }

    document.querySelector("#content").innerHTML = "<p>Here are the results:</p>";

    //This string will contain a string of all the divs created in the following for loop,
    //to be sent to the div #content.
    let bigString = "";

    //This process continues for every amiibo in the array.
    for(position in amiibos){
        //Because of the weirdness of this API, a number is the key and the object we need is the value of that key.
        //The object is put into the variable result to make it easier.
        let result = amiibos[position];

        //A div is created with the class "amiibo" for every amiibo that is in the search results.
        //Here, the data about the amiibo is displayed for the user to see.
        //Name of the amiibo.
        bigString += `<div class = 'amiibo'><h3>${result.name}</h3>`;
        //Image of the amiibo.
        bigString += `<img src='${result.image}' title='${result.name}'  alt=''/>`;
        //The line the amiibo is part of.
        bigString += `<p>Amiibo Line: ${result.amiiboSeries}</p>`;
        //The game/game series the character of the amiibo is part of.
        bigString += `<p>Game Series: ${result.gameSeries}</p>`;
        //Here the release dates of the amiibo across the world is presented.
        //The location and date is presented using presentReleaseDate().
        bigString += `<h4>Release Dates:</h4><ul>`
        bigString += `<li>${presentReleaseDate(result.release.na, "NA")}</li>`;
        bigString += `<li>${presentReleaseDate(result.release.eu, "EU")}</li>`;
        bigString += `<li>${presentReleaseDate(result.release.jp, "JP")}</li>`;
        bigString += `<li>${presentReleaseDate(result.release.au, "AU")}</li></ul>`;
        //The type of amiibo it is.
        bigString += `<p>Type: ${result.type}</p></div>`;
    }

    //After all the divs are constructed, we send it off to the content div.
    document.querySelector("#content").innerHTML = bigString;

    //The status div declares that amiibo have been found.
    document.querySelector("#status").innerHTML = "Amiibo found!";
}

//This method determines how the location and date should be presented. A date and location are passed in.
//It returns a string that is in the format of "Location: Date".
function presentReleaseDate(date, location){
    //If date is null then it means the amiibo never released in that region.
    //Therefore, we put the location followed by N/A because there is no release date.
    if(date == null){
        return `${location}: N/A`;
    }
    //If there is a release date, we continue from here.
    //2 variables are created and defined using the substring method for a string.
    //We then use those 2 substrings along with the location to assemble the string.
    //The reason for this is because it is presented in the form 2015-01-01, which is not commonly used.
    //The substrings are used to allow it to be presented as 01-01-2015 instead.
    else{
        let year = date.substring(0,4);
        let monthDay = date.substring(5);

        return `${location}: ${monthDay}-${year}`;
    }
}