// ----------------------------------- weather forcast website -----------------------------------

// requiring modules
const express = require("express");
const app = express();
const https = require("https");
const path = require('path');
const bodyParser = require("body-parser");
const fetch = require('node-fetch');  // to fetch data from external API asynchronously

const dotenv= require('dotenv');
dotenv.config({ path: './config.env'});

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname,'/views')); // views ke andaar ka maal template engine ko dikhega
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.urlencoded( { extended: true, limit: '10kb'} ));


//Essential Parameter of our forcast data
let city = "kolkata"; // default city
let lat= 22.5697;
let lon= 88.3697;
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
let apiKey = process.env.API_KEY;
let unit = "metric";
let temp12 = [];
let weatherDescr12 = [];
let iconCode12 = [];



function calcDateTime(){
    const nowDate= new Date();
    const option1 ={
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    };
    const finalDate= new Intl.DateTimeFormat('en-US', option1).format(nowDate);

    const nowTime= new Date();
    const option2 ={
        hour: 'numeric',
        minute: '2-digit', // types of value that we can assign to each key
    };
    const finalTime= new Intl.DateTimeFormat('en-US', option2).format(nowTime);

    return { date: finalDate, time: finalTime };
}


app.get("/", function (req, res) { // when user visit our server

    const localTime= calcDateTime().time;
    const localDayDescription= calcDateTime().date;
    

    // we first call our basic api with city name to get its lat, lon. Then we call the hourly api with that lat & lon
    const getData = async (city) => { // getting latitude, longitude using API CALL 1 ----> retieve hourly forecast data using API CALL 2
        try{
            let apiLink = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=" + unit;

            const Resp = await fetch(apiLink);
            if(Resp.ok === false){
                throw new Error('Problem getting first API call');
            }
            const Data = await Resp.json();

            const Lat= Data.coord.lat;   const Lon= Data.coord.lon;
            let oneCallApiLink = "https://api.openweathermap.org/data/2.5/onecall?lat=" + Lat + "&lon=" + Lon + "&exclude=minutely,daily,alerts&units=" + unit + "&appid=" + apiKey;

            const Resp2= await fetch(oneCallApiLink);
            if(Resp2.ok === false){
                throw new Error('Problem getting second API call');
            }
            const DataFinal= await Resp2.json();

            const apiData= {
                tempData: Data,
                finalData: DataFinal
            }

            return apiData;
        } catch( err ){
            throw err;
        }
    }

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
        temperature = Math.round(finalData.current.temp);
        minTemp = Math.floor(tempData.main.temp_min);
        maxTemp = Math.ceil(tempData.main.temp_max);
        windSpeed = finalData.current.wind_speed;
        weatherDescription = finalData.current.weather[0].description;
        humidity = finalData.current.humidity;
        lat= tempData.coord.lat;
        lon= tempData.coord.lon;

        
        //12 hours hourly
        //emptying any previous stored data of array before pushing current city info
        temp12 = [];
        weatherDescr12 = [];
        iconCode12 = [];

        // 24 hours data (every after 2 hour)
        for (let i = 0; i < 12; i++) {
            temp12.push(Math.floor(finalData.hourly[(2*i)+1].temp));
            weatherDescr12.push(finalData.hourly[(2*i)+1].weather[0].description);
            iconLink = " http://openweathermap.org/img/wn/" + finalData.hourly[(2*i)+1].weather[0].icon + "@2x.png"
            iconCode12.push(iconLink);
        }

        // rendering with ejs module
        res.status(200).render("weather", {
            localTime: localTime,
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
            weatherDescr12: weatherDescr12,
            coords: {
                lat: lat,
                lon: lon,
                CITY: city
            }
        });
    };

    getData(city) // calling updateCity promise
        .then(data => updateUI(data)) // if data found, call updateUIwith that data
        .catch(err =>  res.status(404).render('error'));

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
    lat= 22.5697;
    lon= 88.3697;
    res.redirect("/")
});


app.get('*', (req, res) => {
    res.render("errorPage");
});


app.listen(PORT, function () {
    console.log("Server is created at port 3000");
});


//"https://api.openweathermap.org/data/2.5/onecall?lat=22.5697&lon=88.3697&exclude=minutely,daily,alerts&units=metric&appid=9efe2365e0c13efa259f9eb69ae1aef7"
//"https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=9efe2365e0c13efa259f9eb69ae1aef7&units=metric"

//let apiLink = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=" + unit;
//let oneCallApiLink = "https://api.openweathermap.org/data/2.5/onecall?lat=" + Lat + "&lon=" + Lon + "&exclude=minutely,daily,alerts&units=" + unit + "&appid=" + apiKey;