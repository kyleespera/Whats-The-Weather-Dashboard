$(document).ready(function () {
    // Initialize button click event
    $("#btn-search").on("click", function () {
      var city = $("#input-city").val();
      $("#input-city").val("");
      fetchCurrentWeather(city);
      fetchFiveDayForecast(city);
    });
  
    // Handle enter key press event for search button
    $("#btn-search").keypress(function (event) {
      var pressedKey = (event.keyCode ? event.keyCode : event.which);
      if (pressedKey === 13) {
        fetchCurrentWeather(city);
        fetchFiveDayForecast(city);
      }
    });
  
    // Retrieve past searches from local storage
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  
    if (searchHistory.length > 0) {
      fetchCurrentWeather(searchHistory[searchHistory.length - 1]);
    }
  
    // Display previous searches
    for (var i = 0; i < searchHistory.length; i++) {
      addHistoryItem(searchHistory[i]);
    }
  
    // Event listener for past search list items
    $(".history").on("click", "li", function () {
      fetchCurrentWeather($(this).text());
      fetchFiveDayForecast($(this).text());
    });
  // Function to add a city to the search history list
    function addHistoryItem(cityName) {
    // Create a new list item with the city name
      var listItem = $("<li>").addClass("list-group-item").text(cityName);
    // Append the new list item to the history section
      $(".history").append(listItem);
    }
    // Function to fetch and display the current weather for the given city
    function fetchCurrentWeather(cityName) {
    // AJAX call to OpenWeatherMap API for current weather data
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=9f112416334ce37769e5c8683b218a0d",
      }).then(function (data) {
        // Check if the city is not already in the search history
        if (searchHistory.indexOf(cityName) === -1) {
        // Add the city to the search history
          searchHistory.push(cityName);
          // Save the updated search history to local storage
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
          // Add the city to the history list display
          addHistoryItem(cityName);
        }
        // Clear the current weather display
        $("#today").empty();
        // Create and set elements for displaying the weather data
        var weatherTitle = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var weatherIcon = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
        var card = $("<div>").addClass("card");
        var cardContent = $("<div>").addClass("card-body");
        var windSpeed = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humidity = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
        var temperature = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " K");
        var lon = data.coord.lon;
        var lat = data.coord.lat;
        // Fetch the UV Index using another AJAX call
        $.ajax({
          type: "GET",
          url: "https://api.openweathermap.org/data/2.5/uvi?appid=9f112416334ce37769e5c8683b218a0d&lat="  + lat + "&lon=" + lon
        }).then(function (uvData) {
          var uvValue = uvData.value;
          var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
          var uvBtn = $("<span>").addClass("btn btn-sm").text(uvValue);
        // Change the UV Index button color based on its value
          if (uvValue < 3) {
            uvBtn.addClass("btn-success");
          } else if (uvValue < 7) {
            uvBtn.addClass("btn-warning");
          } else {
            uvBtn.addClass("btn-danger");
          }
  
          cardContent.append(uvIndex);
          $("#today .card-body").append(uvIndex.append(uvBtn));
        });
        // Append the weather details to the card and the card to the page
        weatherTitle.append(weatherIcon);
        cardContent.append(weatherTitle, temperature, humidity, windSpeed);
        card.append(cardContent);
        $("#today").append(card);
      });
    }
    // Function to fetch and display a 5-day weather forecast for the given city
    function fetchFiveDayForecast(cityName) {
    // AJAX call to OpenWeatherMap API for 5-day forecast data
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=9f112416334ce37769e5c8683b218a0d&units=imperial"
      }).then(function (data) {
        // Setup the forecast section heading
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

       // Iterate through the forecast data
        for (var i = 0; i < data.list.length; i++) {

        // Filter out data points that are not at 15:00:00
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
        // Create and set elements for displaying the forecast data
            var forecastTitle = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            var forecastIcon = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            var column = $("<div>").addClass("col-md-2.5");
            var forecastCard = $("<div>").addClass("card bg-primary text-white");
            var cardContent = $("<div>").addClass("card-body p-2");
            var dayHumidity = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            var dayTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");
            
           // Append the forecast details to the card and the card to the forecast section
            column.append(forecastCard.append(cardContent.append(forecastTitle, forecastIcon, dayTemp, dayHumidity)));
            $("#forecast .row").append(column);
          }
        }
      });
    }
  });
  