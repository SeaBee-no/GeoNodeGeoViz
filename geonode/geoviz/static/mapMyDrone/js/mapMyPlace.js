
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// global variable 
var   layerControl = null;
var    map = null;
var markersAll = null;
var   circleMarker =null;

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



  // initialize marker
  //https://github.com/Leaflet/Leaflet.markercluster
   markersAll = new L.markerClusterGroup(
    {

      showCoverageOnHover: false,
      spiderLegPolylineOptions: { weight: 1.5, color: '#00FFFF', opacity: 1 },
      spiderfyDistanceMultiplier: 2,
      animate: 'split',
      maxClusterRadius: 35,


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

  let overlayMaps = {
    "GeoNode layer": L.tileLayer.wms("https://geonode.seabee.sigma2.no/geoserver/ows?service=WMS", {
      layers: 'geonode:Team1Dag10_floskjaeret_202305241111',
      format: 'image/png',
      transparent: true,
      attribution: "seabee",
      // access_token:'',
      maxZoom: 22,
    }),
    "Drone flight": markersAll,
  };







  // caustom icone
  let DroneIcon = L.icon({
    iconUrl: '/static/mapMyDrone/img/seabeeLogo.png',
    iconSize: [50, 37],
    iconAnchor: [25, 22],
    popupAnchor: [0, -20],
    // shadowUrl: 'my-icon-shadow.png',
    //shadowSize: [68, 95],
    // shadowAnchor: [22, 94]
  });


  //drone data table array
  const droneDataTable = []

   map = L
    .map('mapD', {

      center: [63.19, 11.62],
      zoom: 6,
      layers: [baseMaps['OSM']]
    });   // center position + zoom

  // add the layer contro
  layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


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

      // call the datatable
      updateDataTable(droneDataTable);

    })
    .catch(error => {
      // Handle errors from fetch operations or parsing JSON
      console.error(error);
    });





  // add the markers from DLB fetch
  let markerDLB = null;

  const markerFunctionForDLB = (dataDLB) => {

    dataDLB.forEach(el => {

      // buils marker
      markerDLB = L.marker(new L.LatLng(el.lat, el.lng),
        {
          title: el.name,
          icon: DroneIcon,
          uuid: el.uuid,
        });
      markerDLB.bindPopup(
        `
   <h6 class="text-white">${el.name}</h6>   
  <table class="table table-info table-striped-columns" style="font-size:14px">
      <thead>
    <tr class="table-dark">
      <th scope="col">Name</th>
      <th scope="col">Info</th>
     
    </tr>
  </thead>
  <tbody>

    <tr>
    <th scope="row">Place</th>
      <td>${el.place_name}</td>
    </tr>

    <tr>
    <th scope="Status">Status</th>
    <td>${el.complete_status}</td> 
    </tr>

    <tr>
    <th scope="row">Flight date</th> 
    <td>${el.flight_date}</td>
    </tr>

 
    <tr>
    <th scope="row">Altitude</th>
    <td>${el.max_altitude} m</td>
    </tr>

    <tr>
    <th scope="row">Poilet</th>
    <td>${el.personnel}</td>
    </tr>

    <tr>
    <th scope="row">Remark</th>
    <td>${el.payload_description}</td>
    </tr>

    </tbody>
  </table>
      
 `
        , {
          maxWidth: 500,
          maxHeight: 500
        }

      );
      // add marker to map
      markersAll.addLayer(markerDLB);

      // droneDataTable add data
      droneDataTable.push([el.name, `<i type="GLB"  class="bi bi-info-circle-fill biStyle text-primary opacity-75"></i>`, el.lat, el.lng,"#","#",el.uuid]);

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
          uuid: el.uuid,
        });
      markerGN.bindPopup(

        `
        <h6 class="text-white">${el.Name}</h6>   
       <table class="table table-info table-striped-columns" style="font-size:14px">
           <thead>
         <tr class="table-dark">
           <th scope="col">Name</th>
           <th scope="col">Info</th>
          
         </tr>
       </thead>
       <tbody>
     
         <tr>
         <th scope="row">Place</th>
           <td>${el.Name}</td>
         </tr>
     
         <tr>
      
         <td colspan="2" >${el.abstract_table}</td> 
         </tr>
     
       
     
         </tbody>
       </table>
           
      `, {
        maxWidth: 500,
        maxHeight: 500
      }



      );
      markersAll.addLayer(markerGN);

      // droneDataTable add data
      droneDataTable.push([el.Name, `<i type="GN"  class="bi bi-info-circle-fill biStyle text-primary opacity-75"></i>`, elxy.lat, elxy.log, el.thumbnail_url, el.detail_url,el.uuid]);


    });
  }


  // ad marker layers
  map.addLayer(markersAll);


  //test ground
  //marker location optimize
//#########################################################

  // L.marker([51.5, -0.09]).addTo(map)
  //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  //     .openPopup();


  // L.marker([51.5, -0.09],{ 
  //   icon:DroneIcon, 
  // }).addTo(map)
  // .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  // .openPopup();



  // circleMarker = L.circleMarker([51.5, -0.09], {
  //   radius: 40,            // Radius of the circle marker
  //   color: 'blue',         // Border color
  //   fillColor: 'lightblue', // Fill color
  //   fillOpacity: 0.7,// Fill opacity
  //   className: 'blinking',     
  // }).addTo(map);

//#########################################################


  // data table funvtion
  let dataTB = null;
  const updateDataTable = (dataSet) => {

    dataTB = new DataTable('#droneList', {

      columns: [
        { title: 'Name' },
        { title: 'Info' }

      ],
      data: dataSet,
      pageLength: 18,
      columnDefs: [
        {
          target: [0],
          //visible: false,
          className: "uppertext"
          //   searchable: false
        },

      ],
      info: true, // Hide the information about entries
      lengthMenu: [
        [18, 25, 50, -1],
        [18, 25, 50, 'All']
      ],
      stripeClasses: ['stripe1', 'stripe2']


    });





// cick on table first row col only
    dataTB.on('click', 'tbody td:first-child', function () {
      let data = dataTB.row($(this).closest('tr')).data();

      //alert('You clicked on ' + data[0] + "'s row");
      locateDroneonMap(([data[2], data[3]]).toString(),data[6]);

    });



// cick on table second row col only
    dataTB.on('click', 'tbody td:nth-child(2)', function () {
      let data = dataTB.row($(this).closest('tr')).data();
      
      // call the model
      modelparaSetting(data);
  
    });


  
   

  }




// model parameter 
const modelparaSetting = (data) =>{
  $("#mapModelopt .modal-title").text(data[0]);
  $("#mapModelopt .img-fluid").attr("src", data[4].length > 0 ? data[4][0] : '#');

  // store info at valaue
  //store latlon
  $("#btn_locate").attr("valuexy",[data[2], data[3]]);
  $("#btn_locate").attr("uuid",data[6]);

   // store layer name 
   $("#btn_overlay").val(data[0]);
   
   // geonode url
   $("#btn_detail").val(data[5]);

   // store layer name to be serach ar minio
   $("#btn_download").val(data[0]);



  mapModel_Obj.show();

}




// dragable property
const mapModel_Obj = new bootstrap.Modal('#mapModelopt', {
  backdrop: false,
  keyboard: false,
  focus: false,
 

});


// script to make model draggable, as bs5 does not have it this feature
// const container = document.getElementById("mapModelopt");
// function onMouseDrag({ movementX, movementY }) {
// 	let getContainerStyle = window.getComputedStyle(container);
// 	let leftValue = parseInt(getContainerStyle.left);
// 	let topValue = parseInt(getContainerStyle.top);
// 	container.style.left = `${leftValue + movementX}px`;
// 	container.style.top = `${topValue + movementY}px`;
// }
// container.addEventListener("mousedown", () => {
// 	container.addEventListener("mousemove", onMouseDrag);
// });
// document.addEventListener("mouseup", () => {
// 	container.removeEventListener("mousemove", onMouseDrag);
// });







// locate the drone on click



$("#btn_locate").on("click", function() {

  locateDroneonMap($(this).attr("valuexy"),$(this).attr("uuid"));
});




const locateDroneonMap = (data,uuid) => {

  let xy = data.split(",");
  map.flyTo([xy[0], xy[1]], 19);

if(circleMarker){
 map.removeLayer(circleMarker);

}
 

sleep(4000).then(() => {

  circleMarker = L.circleMarker([xy[0] , xy[1]], {
    radius: 40,            // Radius of the circle marker
    color: '#2288AA',         // Border color
    fillColor: '#00FFFF', // Fill color
    fillOpacity: 0.2,// Fill opacity
    className: 'blinking',     
  }).addTo(map);

});
//   markersAll.eachLayer(function(layer) {
//     if(layer instanceof L.Marker) {
//        if(layer.options.uuid == uuid){
//         layer.getIcon().options.className = "blinking";
//        }
//     }
// });




}





});





