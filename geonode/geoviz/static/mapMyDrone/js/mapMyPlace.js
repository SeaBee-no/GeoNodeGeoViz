
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
let markers = new L.markerClusterGroup();

const map = L
  .map('mapD',{

    center: [63.19,11.62],
    zoom: 6,
   layers: [baseMaps['ESRI Imagery']]
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
let name = null;
let marker = null;
fetch("/api/dronproject/projectinfo")
  .then(response => response.json())
  .then(data => {


    // Process the received JSON data
    data.forEach(el1 => {
      
       name = el1["Name"];
      
       el1["flights"].forEach( el2 => {
        
        optVal = swapCoordinatesIfNeeded(el2["centroid_lat"], el2["centroid_lon"])
        marker = L.marker(new L.LatLng(optVal.lat, optVal.lng), { title: name });
			  marker.bindPopup(name);
			  markers.addLayer(marker);

       })

		

    });

    map.addLayer(markers);
    
  })
  .catch(error => {
    // Handle errors
    console.error("Error fetching data:", error);
  });




  // Check if the point is outside Norway
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