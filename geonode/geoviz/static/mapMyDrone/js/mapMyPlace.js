
const sleep = (ms) => {
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
    Norgeskart: L.tileLayer("https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
      , {
        attribution: '&copy;norgeskart',
        maxZoom: 30,
        layers: ""
      }),
    'Norgeskart Gray': L.tileLayer("https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart_graatone&zoom={z}&x={x}&y={y}"
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
    'Google Satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      layers: 'NA',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy;Google',
    })

  }

  // initialize marker
  //https://github.com/Leaflet/Leaflet.markercluster
  let markersAll = new L.markerClusterGroup(
    {

      showCoverageOnHover: false,
      spiderLegPolylineOptions: { weight: 1.5, color: '#00FFFF', opacity: 1 },
      spiderfyDistanceMultiplier: 2,
      animate: 'split',
      maxClusterRadius: 40,


    }
  );


  // caustom icone
  var DroneIcon = L.icon({
    iconUrl: '/static/mapMyDrone/img/seabeeLogo.png',
    iconSize: [50, 37],
    iconAnchor: [28, 30],
    popupAnchor: [0, -20],
    // shadowUrl: 'my-icon-shadow.png',
    //shadowSize: [68, 95],
    // shadowAnchor: [22, 94]
  });




  const map = L
    .map('mapD', {

      center: [63.19, 11.62],
      zoom: 6,
      layers: [baseMaps['Google Satellite']]
    });   // center position + zoom

  // add the layer contro
  var layerControl = L.control.layers(baseMaps).addTo(map);


  // reset map if window smap window size chnge
  const mapResetView = (sp) => {

    //reset the map view
    sleep(sp).then(() => {
      map.invalidateSize();
    });
  }



  const fetchDLB = fetch('/api/dronproject/projectinfo');
  const fetchGN = fetch('/api/droneViz/layerlist');

  Promise.all([fetchDLB, fetchGN])
    .then(responses => {
      // Responses array contains the resolved responses
      const [responseDLB, responseGN] = responses;
      return Promise.all([responseDLB.json(), responseGN.json()]);
    })
    .then(data => {
      // Process the parsed JSON data from both responses
      const [dataDLB, dataGN] = data;
      markerFunctionForDLB(dataDLB);
      markerFunctionForGN(dataGN);
    })
    .catch(error => {
      // Handle errors from fetch operations or parsing JSON
      console.error(error);
    });




  // add the markers from DLB fetch
  let markerDLB = null;

  const markerFunctionForDLB = (dataDLB) => {

    dataDLB.forEach(el => {

      markerDLB = L.marker(new L.LatLng(el.lat, el.lng),
        {
          title: el.name,
          icon: DroneIcon,
        });
      markerDLB.bindPopup(`
   <h6 class="text-white">${el.name}</h6>   
  <table class="table table-info table-striped-columns" style="font-size:12px">
      <thead>
    <tr>
      <th scope="col">Info</th>
      <th scope="col">Val</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mark</td>
      <td>Otto</td>
    </tr>
    </tbody>
  </table>
      
 `);

      markersAll.addLayer(markerDLB);


    });
  }

  // add GN layer bbx xy 
  let markerGN = null;
  let elxy = null;
  const markerFunctionForGN = (dataGN) => {

    dataGN.forEach(el => {
      elxy = el["flightsxy"]
      markerGN = L.marker(new L.LatLng(elxy.lat, elxy.log),
        {
          title: el.Name,
          icon: DroneIcon,
        });
      markerGN.bindPopup(el.Name);
      markersAll.addLayer(markerGN);


    });
  }


  // ad marker layers
  map.addLayer(markersAll);






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




  //test ground

  //marker location optimize
  // L.marker([51.5, -0.09]).addTo(map)
  //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  //     .openPopup();


  // L.marker([51.5, -0.09],{ 
  //   icon:DroneIcon, 
  // }).addTo(map)
  // .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  // .openPopup();




});