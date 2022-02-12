// ----------------------------------- weather forcast website -----------------------------------

// requiring modules
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//Essential Parameter of our forcast data

let city = "kolkata"; // default city
let desh;
let temperature;
let maxTemp;
let minTemp;
let weatherDescription;
let weatherIcon;
let dn;
let iconURL;
let windSpeed;
let humidity;
let apiKey = "9efe2365e0c13efa259f9eb69ae1aef7";
let unit = "metric";
let temp12 = [];
let weatherDescr12 = [];
let iconCode12 = [];


app.get("/", function (req, res) { // when user visit our server

    console.log("Inside get");

    let localHour;
    let localMin;
    let localDayDescription;

    function calcTime(city, offset) {

        // create Date object for current location
        d = new Date();
       
        // convert to msec
        // add local time zone offset
        // get UTC time in msec
        utc = d.getTime() + (d.getTimezoneOffset() * 60000);
       
        // create new Date object for different city
        // using supplied offset
        nd = new Date(utc + (3600000*offset));
       
        let hour = nd.getHours();
        let min = nd.getMinutes();
        let options = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        };
        let dayDescription = nd.toLocaleDateString("en-us", options);
        
        
        let dateTime={
            hour: hour,
            min: min,
            dayDescription: dayDescription
        }
        // return time as a string
        return dateTime
    
    }
    localHour=calcTime('Kolkata', '+5.5').hour;
    localMin=calcTime('Kolkata', '+5.5').min;
    localDayDescription=calcTime('Kolkata', '+5.5').dayDescription;
    

    // we first call our basic api with city name to get its lat, lon. Then we call the hourly api with that lat & lon

    const getLatLon = async (city) => { // getting latitude, longitude
        let apiLink = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=" + unit;

        const Resp = await fetch(apiLink);
        const Data = await Resp.json();

        return Data;
    };

    const getWeather = async (Lat, Lon) => { // getting current, hourly forcast by lat, lon
        let oneCallApiLink = "https://api.openweathermap.org/data/2.5/onecall?lat=" + Lat + "&lon=" + Lon + "&exclude=minutely,daily,alerts&units=" + unit + "&appid=" + apiKey;

        const Resp = await fetch(oneCallApiLink);
        const Data = await Resp.json();

        return Data;
    };


    getLatLon(city).then(Dat => { // when getLanLon fetch & convert data in JSON format, we will return (or call) getWeather
        return getWeather(Dat.coord.lat, Dat.coord.lon);
    }).then(Data => { // when getWeather fetch & convert data in JSON format
        console.log("final data recieved");
    }).catch(err => {
        res.redirect("/errorPage");
    });

    const updateCity = async (city) => { // This will give both the api call data
        const tempData = await getLatLon(city);
        const finalData = await getWeather(tempData.coord.lat, tempData.coord.lon);

        let apiData = {
            tempData: tempData,
            finalData: finalData
        };
        return apiData;
    };

    const updateUI = (Data) => { // This will actually use the data & reflect it to .ejs file which user can see (UI)

        let tempData = Data.tempData; // basic api data
        let finalData = Data.finalData; // hourly api data
        //console.log(finalData);
        //Current

        city= tempData.name
        desh = tempData.sys.country;
        weatherIcon = finalData.current.weather[0].icon;
        dn = weatherIcon.charAt(2);
        iconURL = "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
        temperature = Math.round(finalData.current.temp) + 1;
        minTemp = Math.floor(tempData.main.temp_min);
        maxTemp = Math.floor(tempData.main.temp_max) + 2;
        windSpeed = finalData.current.wind_speed;
        weatherDescription = finalData.current.weather[0].description;
        humidity = finalData.current.humidity;

        //12 hours hourly

        //emptying any previous stored data of array before pushing current city info
        temp12 = [];
        weatherDescr12 = [];
        iconCode12 = [];

        for (let i = 0; i < 12; i++) {
            temp12.push(Math.floor(finalData.hourly[(2*i)+1].temp));
            weatherDescr12.push(finalData.hourly[(2*i)+1].weather[0].description);
            iconLink = " http://openweathermap.org/img/wn/" + finalData.hourly[(2*i)+1].weather[0].icon + "@2x.png"
            iconCode12.push(iconLink);
        }

        // rendering with ejs module
        res.render("weather", {
            localHour: localHour,
            localMin: localMin,
            localDayDescription: localDayDescription,
            city: city,
            desh: desh,
            iconURL: iconURL,
            dn: dn,
            temperature: temperature,
            minTemp: minTemp,
            maxTemp: maxTemp,
            windSpeed: windSpeed,
            weatherDescription: weatherDescription,
            humidity: humidity,
            iconCode12: iconCode12,
            temp12: temp12,
            weatherDescr12: weatherDescr12
        });
    };

    updateCity(city) // calling updateCity promise
        .then(data => updateUI(data)) // if data found, call updateUIwith that data
        .catch(err => console.log(err));

});


app.post("/", function (req, res) { // when user make a post request
    city = req.body.newCity; // we grab the city name with body-parser & update our global var city, 
    // input text name is newCity
    console.log(city);
    res.redirect("/"); // & redirect to root where all the processing occurs for that city & finall be rendered
});

app.get("/errorPage", function(req, res){
    res.render("errorPage");
});

app.post("/errorPage", function(req, res){
    city="Kolkata";
    res.redirect("/")
});


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is created at port 3000");
});


//"https://api.openweathermap.org/data/2.5/onecall?lat=22.5697&lon=88.3697&exclude=minutely,daily,alerts&units=metric&appid=9efe2365e0c13efa259f9eb69ae1aef7"
//"https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=9efe2365e0c13efa259f9eb69ae1aef7&units=metric"