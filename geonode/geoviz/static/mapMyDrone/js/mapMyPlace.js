
const sleep=(ms)=>  {
  return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function () {

  //change the left panel btn icone
  $('#panelBtn').click(() => {

    let icon = $("#panelBtn").find('i');
    icon.toggleClass('bi-caret-left-fill bi-caret-right-fill');
       //reset the map view
       mapResetView(200);
  });


  //change the left panel btn icone based on close btn
  $('#leftPanelClose').click(() => {

    let icon = $("#panelBtn").find('i');
    icon.toggleClass('bi-caret-left-fill bi-caret-right-fill');
    mapResetView(200);
  });


  let baseMaps = {
 
    OSM: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      attribution: '&copy;OSM'
    }),
    Norgeskart:L.tileLayer("https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
    , {
      attribution: '&copy;norgeskart',
      maxZoom: 30,
      layers: ""
    }), 
    'Norgeskart Gray':L.tileLayer("https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart_graatone&zoom={z}&x={x}&y={y}"
    , {
      attribution: '&copy;norgeskart',
      maxZoom: 30,
      layers: ""
    }), 
    'ArcGIS Grayscale': L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      maxZoom: 22,
      attribution: '&copy;ESRI'
    }),
    'ESRI Imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 22,
      attribution: '&copy;ESRI'
    }),
    'Google Satellite':  L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 21,
      layers: 'NA',
      subdomains:['mt0','mt1','mt2','mt3'],
      attribution: '&copy;Google',
  })

  }

// initialize marker
let markersDroelogBook = new L.markerClusterGroup();


// initialize marker
let markersGeoNodeLayer = new L.markerClusterGroup();

const map = L
  .map('mapD',{

    center: [63.19,11.62],
    zoom: 6,
   layers: [baseMaps['Google Satellite']]
  });   // center position + zoom

  // add the layer contro
var layerControl = L.control.layers(baseMaps).addTo(map);


// reset map if window smap window size chnge
const mapResetView = (sp) =>{

     //reset the map view
     sleep(sp).then(() => {
      map.invalidateSize();
    });
}



// fetch the requre data
let nameDLB = null;
let markerDLB = null;
let loptValDLB = null;

fetch("/api/dronproject/projectinfo")
  .then(response => response.json())
  .then(data => {


    // Process the received JSON data
    data.forEach(el1 => {
      
       nameDLB = el1["name"];
        //loptValDLB = swapCoordinatesIfNeeded(el2["centroid_lat"], el2["centroid_lon"])
        markerDLB = L.marker(new L.LatLng(el1.lat, el1.lng), { title: nameDLB });
			  markerDLB.bindPopup(nameDLB);
			  markersDroelogBook.addLayer(markerDLB);

    

		

    });

    map.addLayer(markersDroelogBook);
    
  })
  .catch(error => {
    // Handle errors
    console.error("Error fetching data:", error);
  });




  // fetch the requre data
let nameGN = null;
let markerGN = null;
let loptValGN = null;
fetch("/api/droneViz/layerlist")
  .then(response => response.json())
  .then(data => {


    // Process the received JSON data
    data.forEach(el1 => {
      
      nameGN = el1["Name"];
      loptValGN = el1["flightsxy"]
      markerGN = L.marker(new L.LatLng(loptValGN.lat, loptValGN.log), { title: nameGN });
      markerGN.bindPopup(nameGN);
      markersGeoNodeLayer.addLayer(markerGN);

    

		

    });

    map.addLayer(markersGeoNodeLayer);
    
  })
  .catch(error => {
    // Handle errors
    console.error("Error fetching data:", error);
  });







  // its a error in the dronelogbook data and must be Check if the point is outside Norway
  // if its outside perhaps need to swap the xy cordinate
function swapCoordinatesIfNeeded(lat, lng) {

// NO BBx from https://gist.github.com/graydon/11198540
  // Bounding box coordinates for Norway
  const minLat = 58.0788841824;
  const maxLat = 80.6571442736;
  const minLng = 4.99207807783;
  const maxLng = 31.29341841;

  // Check if the point is outside the bounding box
  const isOutside = lat < minLat || lat > maxLat || lng < minLng || lng > maxLng;

    // it get true
  if (isOutside) {
    // Swap the coordinates
    [lat, lng] = [lng, lat];
  }

  return { lat, lng };
}

});