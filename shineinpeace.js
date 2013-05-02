$(document).ready(function(){      
    
    

    
        
/*    Create the map     */
    
var pointData = [];
        
                
var homicide = []
,injury = []
,noInjury = []
,shooting = []
,everything = []

window.dotsColored = false

window.dataGoogleDoc = 'https://docs.google.com/spreadsheet/pub?key=0AnZDmytGK63SdHZoYWM5UklxaXI4bEpqS3cta1hid1E&output=csv';

                //d3.csv('https://docs.google.com/spreadsheet/pub?key=0ApAkxBfw1JT4dGNLVEJoWGthSmJvUVgyOG5YeW9ZN2c&single=true&gid=0&output=csv', function(error, _json){ showInfo(_json) })

//
d3.csv(window.dataGoogleDoc, function(error, _json){ loadGeoJSONLayers(_json); })
	        
    function mapNewPoint(pointData){   
        
        // Create all of the popup HTML using ICH.js
        // Setting the 2nd argument as true returns an HTML string  
        var homicidePop = ich.homicidePop(pointData, true);
        var injuryPop = ich.injuryPop(pointData, true);
        var noInjuryPop = ich.noInjuryPop(pointData, true);
        var shootPop = ich.shootPop(pointData, true);  
        
        // Create a color based on the date (in UNIX format)
        var pntColor = dateColorScale(pointData.unix)                
                
		//place points
		if (pointData.homicidetag == "TRUE"){                       
            var pntLatLng = new L.LatLng(pointData.lat, pointData.lng)
            
            var h_pntSize = 120;
            
            point = new L.circle(pntLatLng, h_pntSize, {
                color: "red",
                stroke: false,
                fillOpacity: 0.75
                        
            })
            
            colorPoint = new L.circle(pntLatLng, h_pntSize, {
                color: pntColor,
                stroke: false,
                fillOpacity: 0.75
                        
            })
            
            
            // Create a point with the default color set
            point.bindPopup(homicidePop)
            
            // Create a point with the color determined by time
            colorPoint.bindPopup(homicidePop) 
            
            // Push a colored point to the layer if the window.dotsColored is true
            if(window.dotsColored){
                homicide.push(colorPoint)
            }
            else {
                homicide.push(point)            
            }
            
		}
		else if (pointData.shootinjurytag == "TRUE") {
                        
                        
            var si_pntSize = 90;
                        
            var pntLatLng = new L.LatLng(pointData.lat, pointData.lng)
            point = new L.circle(pntLatLng, si_pntSize, {
                color: '#7D010C',
                weight: 0,
                fillOpacity: 0.5                        
            })


            colorPoint = new L.circle(pntLatLng, si_pntSize, {
                color: pntColor, //'#7D010C',
                weight: 0,
                fillOpacity: 0.5                        
            })
                                    
            point.bindPopup(injuryPop)  
            colorPoint.bindPopup(injuryPop)  
                    
            if(window.dotsColored){ injury.push(colorPoint) }
            else { injury.push(point) }

		}
		else if (pointData.shoottag == "TRUE") {            
                                  
            var s_pntSize = 72;
            var pntLatLng = new L.LatLng(pointData.lat, pointData.lng)
            point = new L.circle(pntLatLng, s_pntSize, {
                color: '#2A0004',
                stroke: false,
                fillOpacity: 0.45
                        
            })
            
            colorPoint = new L.circle(pntLatLng, s_pntSize, {
                color: pntColor,
                stroke: false,
                fillOpacity: 0.45
                        
            })
                                    
            point.bindPopup(shootPop) 
            colorPoint.bindPopup(shootPop)
            
            if(window.dotsColored){ shooting.push(colorPoint) }  
            else { shooting.push(point) }
		}                                            
    }


    function loadGeoJSONLayers(_json) {
        
        // Gang injunction zones
        d3.json("data/GangInjunctionZones.geojson", function(geojson){ 
            function onEachFeature(feature, layer) {
                if (feature.properties && feature.properties.popupContent) {
                    layer.bindPopup(feature.properties.popupContent);
                }
            }  

            window.gangInjunctionZones = new L.geoJson(geojson, {        
                onEachFeature: onEachFeature
                ,style: {
                    color: "yellow"
                    ,opacity: 0.35
                }
            }).addTo(map);
        
        
            // Oakland Police Beats
            d3.json("data/oak_policebeats.geojson", function(geojson){ 
                function onEachFeature(feature, layer) { layer.bindPopup(feature.properties.Name); }  

                window.oakPoliceBeats = L.geoJson(geojson, {
                    onEachFeature: onEachFeature
    
                    ,style: {
                        color: "black"
                        ,fillColor: "#CCC"
                        ,opacity: 0.6
                        ,fillOpacity: 0.35
                        ,stroke: "black"  
                        ,weight: 2          
                    }
                })//.addTo(map);        
                
                d3.json("data/oak_citycouncildistricts.geojson", function(geojson){ 
                    function onEachFeature(feature, layer) { console.log("feature", feature); layer.bindPopup(feature.properties.Name); }  

                    window.oakCouncilDistricts = L.geoJson(geojson, {
                        onEachFeature: onEachFeature
    
                        ,style: {
                            color: "red"
                            ,fillColor: "#999"
                            ,opacity: 0.6
                            ,fillOpacity: 0.35
                            ,stroke: "black"  
                            ,weight: 2          
                        }
                    })//.addTo(map);        
                
                    showInfo(_json)                
                })
                
            })
            

    
        })
    
    
    }
    






    
    var shootingLayer, injuryLayer, homicideLayer, colorLayer;        
    
    //grab map info and plot
	function showInfo(data) {        
        var eventDates = []
        
        _.each(data, function(row){
            
            // We use the eventDates variable to generate a color scale
            // based on the dates of the events
            
            eventDates.push(+moment(row.DATE + " " + row.Year, "MMMM D YYYY" ))
            // Add the current time so the scale is always relative to now
            eventDates.push(+moment())
            
            
            // Create 2 date formats
            
            // dateFormat is a 'conversational' tone, like "2 months ago"
            var dateFormat = moment(row.DATE + " " + row.Year, "MMMM D YYYY" ).fromNow(false)
            
            // dateFormat2 is a 'formal' tone, like "Jan 2nd"
            var dateFormat2 = moment(row.DATE + " " + row.Year, "MMMM D YYYY" ).format("MMM Do")
                    
                    
            // Create an object for each map point
            insertMapInfo = {
                lat: parseFloat(row.LATITUDE)
                ,lng: parseFloat(row.LONGITUDE)
                ,beat: row.BEAT
                ,homicidetag: row.HomicideTag
                ,shootinjurytag: row.ShootInjuryTag
                ,shootnoinjurytag: row.ShootNoinInjuryTag
                ,shoottag: row.ShootTag
                ,address: row.ADDRESS
                ,date: dateFormat
                ,date2: dateFormat2
                ,time: row.TIME
                ,rdNumber: row.RD
                ,statute: row.STATUTE
                ,victims: row.Victims
                ,noofvictims: row.NoOfVictims
                ,unix: +moment(row.DATE + " " + row.Year, "MMMM D YYYY" )
            }
			
            // Add our object to our pointData array
			pointData.push(insertMapInfo)    
        })


        // Create our color scale based on the earliest/most recent
        // dates found in our data
        // and scales them between black (oldest) and red (most recent)
        dateColorScale = d3.scale.linear()
        .domain([d3.min(eventDates), d3.max(eventDates)])
        .range(["#D44517", "#470701"])
                
                
        // Map all the points and then remove the loading div
		for (var i = 0; i < pointData.length; i++) {                     
            mapNewPoint(pointData[i])
            
            if(i == pointData.length - 1 ){ 
                $("#loading").hide();			
            } 			                                
		}

        
        


        // Add our layers to the window so that our callbacks in HTML can access them
        window.shootingLayer = shootingLayer = L.layerGroup(shooting).addTo(map);             
        window.injuryLayer   = injuryLayer   = L.layerGroup(injury).addTo(map);
        window.homicideLayer = homicideLayer = L.layerGroup(homicide).addTo(map);
                      
        // Tell Leaflet what layer to include as checkboxes in the controls
        var overlayMarkers = {
            "OPD Police Beats": window.oakPoliceBeats                             
            ,"Homicides": homicideLayer
            ,"Shootings with injuries": injuryLayer
            ,"Shootings": shootingLayer
            ,"Gang Injunction Zones": window.gangInjunctionZones
            ,"City Council Districts": window.oakCouncilDistricts
            }
                
                
            // Create the control, and define collapsed as false
            // otherwise the checkboxes are hidden initially
        map.addControl(L.control.layers(null,overlayMarkers,{               
            collapsed: false,
            position: 'topleft'
        }))
              
              
              
        // Data stuff
        

        _json = data;
        console.log(_json[0])      
      
        var count = {}
      
        count.shootings = _json.length
      
        count.beat = _.countBy(_json, function(d){ return d.BEAT })
      
        count.desc = _.countBy(_json, function(d){ return d.DESCRIPTION })
      
        count.homicides = _.countBy(_json, function(d){ return d.HomicideTag })
      
        count.injuries = _.countBy(_json, function(d){ return d.ShootInjuryTag })
      
        count.hourBreakdown = _.countBy(_json, function(d){ return moment(d.TIME, "h:m A" ).format("HH"); })
        count.hourBreakdown = _.sortBy(count.hourBreakdown, function(hour) {
            //return hour
        })
        count.hourBreakdownMax = _.max(count.hourBreakdown, function(hour) { return hour; })
      
      
        //console.log("hour breakdown", count.hourBreakdown, "max", count.hourBreakdownMax)
      
        count.dayBreakdown = _.countBy(_json, function(d){  return moment(d.DATE + " " + d.Year, "MMMM DD YYYY" ).format("ddd"); })
        console.log("dayBD", count.dayBreakdown)
      
      
        //console.log("count day breakdown", count.dayBreakdown)

      
        //console.log("COUNT!", count)
        
        $("#total-incidents").text(count.shootings)
      
        makeBarChart("#hour-breakdown", count.hourBreakdown)

        makeBarChart("#weekday-breakdown", count.dayBreakdown)
        
      
        makeBarChart("#beat-breakdown", count.beat)
      
        makePieChart("#injury-percentage", count.injuries)
        

        
        
        
        // Create stepper items
      
        var filteredData = {}
        
        filteredData.homicides = _.filter(_json, function(d) {
            if(d.HomicideTag == "TRUE"){ 
                return true;
            }
            else {
                return false;
            }
        }).reverse();
        
        _.each(filteredData.homicides.slice(0, 10), function(d) {
            
            var $stepper = $("#sStepper #stepper-sections");        
            
            var dateFormat2 = moment(d.DATE + " " + d.Year, "MMMM D YYYY" ).format("MMM Do")
                        
            var stepperSectionData = {
                title: d.Victims
                ,enterCallback: "window.map.panTo(["+d.LATITUDE+","+d.LONGITUDE+"]); window.map.setZoom(15)"
                ,exitCallback:  ""
                ,lat: d.LATITUDE
                ,lng: d.LONGITUDE
                ,address: d.ADDRESS
                ,dateTime: d.TIME + " " + d.DATE + " " + d.Year
                ,formattedDate: dateFormat2
                ,victims: d.Victims
                ,stepper: d.Stepper
            
            }
            
            var newStep = $(ich.stepperSectionTemplate(stepperSectionData, true));
            //console.log(newStep.html())
            
            $stepper.append(newStep)
            
        
        })
        
        sStepper.init("#sStepper");
        

        
	}
	
    
    
    
// INITIALIZE MAP //
		
//initalize map
var map = window.map = L.map('map',{
	center: [37.781027,-122.22393],
	zoom: 12,
    scrollWheelZoom: false
})

map.attributionControl.addAttribution("Data Journalism by John C. Osborn");



//var layer = new L.StamenTileLayer("toner-lite");
var layer = new L.StamenTileLayer("terrain");
map.addLayer(layer);        
        
        
var layer3 = new L.StamenTileLayer("toner-lines");
//map.addLayer(layer3);
        
var layer2 = new L.StamenTileLayer("toner-labels");
//map.addLayer(layer2);


/*
var miniMapLayer = new L.StamenTileLayer("toner");

var miniMap = new L.Control.MiniMap(miniMapLayer).addTo(map)
*/

var osmUrl='http://tile.stamen.com/toner/{z}/{x}/{y}.png';
var osmAttrib='Map data &copy; OpenStreetMap contributors';

var osm2 = new L.TileLayer(osmUrl, {minZoom: 0
    ,maxZoom: 13
    ,attribution: osmAttrib
    ,unloadInvisibleTiles: true
    ,detectRetina: true});
    
    
var miniMap = new L.Control.MiniMap(osm2, { 
    toggleDisplay: true
    ,position: 'topright'
    ,zoomLevelOffset: -3
    ,width: 340
    ,height: 200
    ,zoomAnimation: true }).addTo(map);







// TODO: I am trying to figure out how to toggle coloring
// the dots by date and their defaults... it's not really working
window.toggleDotColors = function toggleDotColors(){
    if(window.dotsColored) {
        window.dotsColored = false;
        return false;
    }
    else {
        window.dotsColored = true;
        return true;
    }
}

$("#dot-color-toggle").click(function(){
    window.toggleDotColors();
})


// Logic for the left menu
$('#category-list li').click( function(){
    $('#category-list li').removeClass("active");
    $(this).addClass("active");
    console.log("PARENT", $(this).parent())
    
    var id = $(this).attr("id");
    
    
    if(id == "points") {
        togglePoints();
        toggleHexmap();        
    }
    else if (id == "hex") {
        if($("#hexmap").css("display") == "none") {
            toggleHexmap();
            togglePoints();
        }

    }
    
    
})









/* Hexmap stuff */

// Functions to toggle the points and the hexmap
window.toggleHexmap = function toggleHexmap() {
    if($("#hexmap").css("display") == "inline") { 
        $("#hexmap").hide();                
    }
    else {        

        $("#hexmap").show();
    }


}

window.togglePoints = function togglePoints() {

    if(!map.hasLayer(shootingLayer) 
    && !map.hasLayer(homicideLayer)
    && !map.hasLayer(injuryLayer)){

        map.addLayer(shootingLayer)
        map.addLayer(homicideLayer)
        map.addLayer(injuryLayer)    
       
    }
    else {             
        map.removeLayer(homicideLayer)
        map.removeLayer(injuryLayer)
        map.removeLayer(shootingLayer) 
    }


}

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");
    
    // Initially hide the hexmap, we'll have a button to show it
    g.style("display", "none").attr("id", "hexmap")
    
    
d3.json("data/oakland_victims.geojson", function(collection){    
    makeHexBin(collection);

    // Convert our D3 projections to leaflet
    function project(x) {
        var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
        return [point.x, point.y];
    }

    function makeHexBin(collection) {        
        var bounds = d3.geo.bounds(collection),
            bottomLeft = project(bounds[0]),
            topRight = project(bounds[1]);
    
        var path = d3.geo.path().projection(project);
        
        
        // Create the scale for each hex based on how many victims
        var incidentMin = d3.min(collection.features, function(r) {  return r.properties.Victims }),
        incidentMax = d3.max(collection.features, function(r) { return r.properties.Victims        });        
        
        // Scale between 0 and 0.95 because it's for opacity
        // because it can be 0-1
        var incidentScale = d3.scale.linear()
        .domain([0, incidentMax])
        .range([0.05,1])
        

        var incidentScaleColor = d3.scale.linear()
            .domain([0, incidentMax])
            .interpolate(d3.interpolateHsl)
            .range(['black', '#D40067'])
    
    

        var feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("path");      
            
            // Redraw the thing when the map does anything
            map.on("viewreset", hexReset);
            hexReset();
            
            function hexReset() {
                
                // The color used for the hexmap
                // Data is represented by opacity      
                var highlightColor = "black";
                
                var bottomLeft = project(bounds[0]),
                topRight = project(bounds[1])
                
                svg.attr("width", topRight[0] - bottomLeft[0])
                .attr("height", bottomLeft[1] - topRight[1])
                .style("margin-left", bottomLeft[0] + "px")
                .style("margin-top", topRight[1] + "px")
                
                g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")")
                
                feature.attr("d", path)
                

                feature.style("fill-opacity", function(d,i) {
                    if(d.properties.Victims != undefined ){
                    return incidentScale(parseInt(d.properties.Victims))                                }
                })
                
                feature.style("fill", function(d,i){
                    if(d.properties.Victims != undefined ){
                        return incidentScaleColor(parseInt(d.properties.Victims))                          }
                })
                
                feature
                //.style("fill", highlightColor)
                .style("stroke", function(d,i) {
                    if(d.properties.Victims > 0) {
                        return highlightColor
                    }
                    else {
                        return "rgba(200,200,200,0.85)"
                    }
                
                })
                .style("stroke-width", 0.5)
                                            
            }      
    }	    

})   
})














/* Make the charts / graphs */


var makePieChart = function makePieChart(targetElement, data) {
    
    //console.log("piedata", data)
    
    var pieData = []
    
    pieData = [
        {
            key: "Injuries"
            ,y: parseInt(data.TRUE)
        }
        ,{
            key: "No injuries"
            ,y: parseInt(data.FALSE)
        }
    ]

    var chart;
    nv.addGraph(function() {
 
        $targetElement = $(targetElement)

        var width = $targetElement.width(),
        height = $targetElement.height();
  


        chart = nv.models.pieChart()
            .x(function(d) { return d.key })
            .y(function(d) { return d.y })
            //.showLabels(false)
            .values(function(d) { return d })
            //.color(d3.scale.category10().range())
            .color(function(d,i){ if( i % 2 == 0 ) { return "black"} else { return "#999"} })            
            //.width(width)
            //.height(height);

          d3.select(targetElement+" .chart")
              .datum([pieData])
            .transition().duration(1200)
              .attr('width', width)
              .attr('height', height)
              .call(chart);

        return chart;
    });


}
var makeBarChart = function makeBarchart(targetElement, data) {

    $targetElement = $(targetElement)

    var width = $targetElement.width(),
    height = $targetElement.height();
  
      nv.addGraph({
        generate: function() {
            
        dataBreakdown = data

        dataBreakdown = _.map(dataBreakdown, function(row, i){
            
            if(targetElement == "#hour-breakdown") {
                //console.log("ROW", row)
                var ourHour = moment(i.toString(), "H")
                
                i = ourHour.format("ha")
            
            }
           
            return {
                "label": i,
                "value": row              
            }
        })
        
            
        
          var chart = nv.models.discreteBarChart()
              //.showValues(true)
              .tooltips(true)
              //.width(width)
              //.height(height)
              .x(function(d){ return d.label })
              .y(function(d){ return d.value })
              .color(function(){ return "black" })
              .margin({top: 24, right: 36, bottom: 24, left: 36})
                           
              
          
          d3.select(targetElement+" .chart")
            .attr('width', width)
            .attr('height', height)
            .datum([{
                key: "Hour breakdown",
                values: dataBreakdown
            }])
            .call(chart);
            
            
            chart.yAxis
            
                        
          return chart;
        },
        callback: function(graph) {


          /*
          graph.dispatch.on('elementClick', function(e) {
              console.log("Bar Click",e);
          });

          graph.dispatch.on('chartClick', function(e) {
              console.log("Chart Click",e);
          });

          graph.dispatch.on('chartClick', function(e) {
              console.log('Click Switching to');
              if (td === 0) {
                  d3.select("#test1")
                          .datum(testdata2)
                          .call(graph);
                  td = 1;

              } else {
                  d3.select("#test1")
                          .datum(testdata)
                          .call(graph);
                  td = 0;
              }
            });
          */


          /*
          window.onresize = function() {
          
          var width = $targetElement.width(),
          height = $targetElement.height();
          
          
            graph
              .width(width)
              .height(height)

            d3.select(targetElement+" .chart")
                .attr('width', width)
                .attr('height', height)
              .call(graph);
          };
          
          */
        }
      });
} 















/* Misc additional stuff */

// Smooth scrolling

$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
        || location.hostname == this.hostname) {

        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
           if (target.length) {
             $('html,body').animate({
                 scrollTop: target.offset().top
            }, 1600);
            return false;
        }
    }
});

window.scrollToData = function scrollToData() {
        var target = $("#data");
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
           if (target.length) {
             $('html,body').animate({
                 scrollTop: target.offset().top - 24
            }, 1600);
            return false;
        }
    }

