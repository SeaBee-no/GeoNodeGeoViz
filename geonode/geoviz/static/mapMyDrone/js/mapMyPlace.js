
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// global variable 
var layerControl = null;
var map = null;
var markersAll = null;
var circleMarker = null;
var GN_Overlay_layer = null;
var droneDataTable = null;
var dataTB = null;
var drawnItems = null;
var editableLayers = null
var selectedItemgrouoLayer = null;
var btnRemoveEdit = null;
var dynamicTableUpdateFlag = true;
var  otterLayer =null;
var  updateDataTable = null;
var markerFunctionForGN = null;
var  dataGNmain = null;
var  updateMapStateInfo = null; 
var updatePolarChart = null;

// initilize the driverjs
let driver = null
let driverObj = null;

$(document).ready(function () {


  // initilize the driverjs
 driver = window.driver.js.driver;
  driverObj =  driver({
   // showButtons: ['next', 'previous'],
    showProgress: true,
    steps : stepsIntro,
    popoverClass: 'driverjs-theme',
    overlayColor: '#000000',
    nextBtnText: 'Next —›',
    prevBtnText: '‹— Previous',
    doneBtnText: '✕',
  });
  



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
      maxClusterRadius: 30,

    });


 // otter layer
otterLayer = L.layerGroup();



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

  overlayMaps = {
    "<img class='pb-2' width='30px' src='../static/mapMyDrone/img/seabeeLogo.png' alt='...'>  Drone flight": markersAll,
    "<img class='pb-2' width='40px' src='../static/mapMyDrone/img/otter_drone.png' alt='...'>Otter mision": otterLayer,

  };



  GN_Overlay_layer = L.tileLayer.wms("https://geonode.seabee.sigma2.no/geoserver/ows?service=WMS", {
    layers: '',
    format: 'image/png',
    transparent: true,
    attribution: "seabee",
    access_token: '',
    maxZoom: 30,
  });



  // caustom drone map icone
 /* let DroneIcon = L.icon({
    iconUrl: '/static/mapMyDrone/img/seabeeLogo.png',
    iconSize: [50, 37],
    iconAnchor: [25, 22],
    popupAnchor: [0, -20],
    // shadowUrl: 'my-icon-shadow.png',
    //shadowSize: [68, 95],
    // shadowAnchor: [22, 94]
  });*/


  DroneIcon = L.divIcon({
    className: 'leaflet-marker-icon',
    html: '  <div class="leaflet-marker-icon marker-cluster marker-cluster-small leaflet-zoom-animated leaflet-interactive" tabindex="0" role="button" style=" width: 40px; height: 40px; z-index: 631; opacity: 1; outline-style: none;"><div><span>1</span></div></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });




    // caustom drone map icone
    let OtterIcon = L.icon({
      iconUrl: '/static/mapMyDrone/img/otter_drone.png',
      iconSize: [50, 37],
      iconAnchor: [25, 22],
      popupAnchor: [0, -20],
      // shadowUrl: 'my-icon-shadow.png',
      //shadowSize: [68, 95],
      // shadowAnchor: [22, 94]
    });


  //drone data table array
  droneDataTable = []

  map = L
    .map('mapD', {

      center: [63.19, 11.62],
      zoom: 6,
      layers: [baseMaps['OSM']]
    });   // center position + zoom


  // chnage the attibution
  map.attributionControl.setPrefix('<button id="creditBtn" style="font-size:12px" type="button" class="btn btn-link link-underline link-underline-opacity-0 p-0 m-0">©SeaBee</button>')

  //initlize the draw edit layer
  editableLayers = new L.FeatureGroup();
  mapLayers = map.addLayer(editableLayers);

  // initilze the selected marker layer 
  selectedItemgrouoLayer = L.layerGroup().addTo(map);

  // add the layer contro
  layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);




  let miniMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  let miniMap = new L.Control.MiniMap(miniMapLayer, { toggleDisplay: true, position :'topleft' }).addTo(map);




  // reset map if window smap window size chnge
  const mapResetView = (sp) => {

    //reset the map view
    sleep(sp).then(() => {
      map.invalidateSize();
    });
  }





  // Initialise the FeatureGroup to store editable layers

  // Initialise the draw control and pass it the FeatureGroup of editable layers
  var drawPluginOptions = {
    position: 'topright',
    draw: {
      polyline: false,
      circlemarker: false,
      polygon: {
        allowIntersection: false, // Restricts shapes to simple polygons
        drawError: {
          color: '#800000', // Color the shape will turn when intersects
          message: '<strong>Polygon draw does not allow intersections!<strong>' // Message that will show when intersect
        },
        shapeOptions: {
          color: '#00B9FF'
        }
      },
      circle: false, // Turns off this drawing tool
      rectangle: {
        shapeOptions: {
          color: '#00B9FF'
        }
      },
      marker: false,
    },
    edit: {
      featureGroup: editableLayers, //REQUIRED!!
      remove: false,
      edit: false,
    }
  };


  // Initialise the draw control and pass it the FeatureGroup of editable layers
  var drawControl = new L.Control.Draw(drawPluginOptions);
  map.addControl(drawControl);


// event fire when map drow created
  map.on('draw:created', function (e) {
    var type = e.layerType,
      layer = e.layer;

    if (type === 'marker') {
      layer.bindPopup('A popup!');
    }

    editableLayers.addLayer(layer).bringToBack();


    let drawnGeometry = layer.toGeoJSON();
    let drawnFeature = L.geoJSON(drawnGeometry);


    //desect previus row in the table
    dataTB.rows().deselect();


    // Iterate through the list of markers
    markersAll.eachLayer(function (marker) {
      // Check if the marker's LatLng is inside the drawn geometry
      if (marker.getLatLng && drawnFeature.getBounds().contains(marker.getLatLng())) {


        let tempmarker = L.circleMarker(marker.getLatLng(), {
          radius: 40,            // Radius of the circle marker
          color: '#2288AA',         // Border color
          fillColor: '#00FFFF', // Fill color
          fillOpacity: 0.2,// Fill opacity
          className: 'blinking',
        });

        // select the points on the map
        tempmarker.addTo(selectedItemgrouoLayer);

        // selecet the rows on table

        // get the index number
        let indexID = dataTB
          .column(2)
          .data()
          .filter(function (value) {
            return value === marker.options.uuid;
          })
          .map(function (filteredValue) {
            return dataTB.column(2).data().indexOf(filteredValue);
          })[0];

        //select the row
        dataTB.row(`:eq(${indexID})`).select();



      }

      
    }
    
    );

   
// lock the table update 
    dynamicTableUpdateFlag = false;
    $(btnRemoveEdit.button).addClass('bg-info text-white ');


  });







  map.on('draw:drawstart', function (e) {

    // click on the btn using js to clear all skitches
    btnRemoveEdit.button.click();

  });



  // clear the layer content of edit layer and selected icone on map
  btnRemoveEdit = L.easyButton('<i class="bi bi-eraser" style="font-size:16px" ></i>',
    (btn, map) => {

   
      editableLayers.clearLayers();
      selectedItemgrouoLayer.clearLayers();
      dataTB.rows().deselect();
      if (circleMarker) {
        map.removeLayer(circleMarker);
      }

      //remove the overlay layer
      if (map.hasLayer(GN_Overlay_layer)) {
        map.removeLayer(GN_Overlay_layer);
      }


      // unlock the table update 
    dynamicTableUpdateFlag = true;
    $(btnRemoveEdit.button).removeClass('bg-info text-white ');

    }, "Clear the drawning from the map").addTo(map).setPosition('topright');



    // ecape key to  clear all edit

    $(document).keydown(function(event) {
      if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
        // The Escape key was pressed
        // You can perform your desired action here
        btnRemoveEdit.button.click();
      }
    });
    
   




  const fetchGN = fetch('/api/droneViz/layerlist');
  const fetchOtter = fetch('/api/droneViz/otterlist');



  Promise.all([fetchGN, fetchOtter])
    .then(responses => {
      // Responses array contains the resolved responses
      const [ responseGN, responseOtter] = responses;
      return Promise.all([ responseGN.json(), responseOtter.json()]);
    })
    .then(data => {
      // Process the parsed JSON data from both responses
      const [ dataGN, dataOtter] = data;

      dataGNmain = [...dataGN];

      markerFunctionForGN(dataGN);
      markerFunctionForOtter(dataOtter)

      // call the datatable
      //updateDataTable(droneDataTable);u


    })
    .catch(error => {
      // Handle errors from fetch operations or parsing JSON
      console.error(error);
    });


    




    // add otter icone to map
    let markerOtter = null;
    const markerFunctionForOtter = (dataOtter) =>{

    dataOtter.forEach(el => {

     

      markerOtter = L.marker(new L.LatLng(el.latitude, el.logitude),
        {
          title: el.location_name,
          icon: OtterIcon,
          uuid: el.mission_id,
        });
        markerOtter.bindPopup(
        `
   <h6 class="text-white">${el.location_name}</h6>   
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
      <td>${el.location_name}</td>
    </tr>

    <tr>
    <th scope="Status">Date</th>
    <td>${el.mission_date}</td> 
    </tr>

    <tr>
    <th scope="row">Comments</th> 
    <td>${el.comments == null?'-':el.comments }</td>
    </tr>

    </tbody>
  </table>
      
 `
        , {
          maxWidth: 500,
          maxHeight: 500
        }

      ).on('click', (ev) => {

   

      });
    

      otterLayer.addLayer(markerOtter);

    });

   
    }





  
  // add GN layer bbx xy 

  markerFunctionForGN = (dataGN) => {


  let markerGN = null;
  let elxy = null;
  droneDataTable = []

  markersAll.clearLayers();

  // buils and test marker
     // L.marker([elxy.lat, elxy.log]).addTo(map);

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



      ).on('click', (ev) => {

        locateDroneonMap(([ev.latlng.lat, ev.latlng.lng]).toString(), false);


            // lock the table update 
            dynamicTableUpdateFlag = false;
            $(btnRemoveEdit.button).addClass('bg-info text-white ');

            setTimeout(() => {
            let selecetdRow = dataTB.row('.table-info');
            let positionRow = $(selecetdRow.node()).position().top - $(dataTB.table().node()).parent().position().top;
                        // Scroll to the selected row
            $(dataTB.table().node()).parent().scrollTop(positionRow);},1000); 



      });


      markersAll.addLayer(markerGN);

      // droneDataTable add data
      droneDataTable.push([
      el.Name, 
      `<i type="GN"  class="bi bi-info-square-fill biStyle text-primary opacity-75"></i>`,
      elxy.lat,
      elxy.log,
      el.thumbnail_url,
      el.detail_url,
      el.uuid,
      el.abstract_table,
        "GN_layer",
        el.thumbnail_url_compress,
      el.flight_date,
    el.theme,
  el.area_sqkm]);


 


    });

   updateDataTable(droneDataTable);
   //  map stat on table
   updateMapStateInfo (droneDataTable);
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

  updateDataTable = (dataSet) => {

    // add a fale colume for the hidden boolean to sort the table
    // dataSet = dataSet.map(function(item) {
    //   item.push('fasle');
    //   return item;
    //  });


    if (dataTB != null) {
      $("#droneList").dataTable().fnDestroy();
    }


    dataTB = new DataTable('#droneList', {

      columns: [
        { data: 0, 
          title: "Name",
         // className: "Title",
          render: (data, type, row)=> {
           
           

            return  `


        <div class="card-user-list">
            <div class="row g-0">
                <div class="col-2 text-center align-self-center">    
                  <img loading="lazy" style="width: 75px; height:75px; object-fit:cover" 
                  class="  rounded-circle ratio ratio-1x1 p-0 m-0" 
                  src="${ row[9] }" alt="seabee">
                </div>
                <div class="col-10">
                    <div class="card-body">
                        <h6 class="card-title m-0 text-info-emphasis">${toTitleCase(data).toUpperCase()}</h6>
                        <div class="hstack gap-2 ps-4 pt-2">
                          <div class="p-2 text-dark fst-italic">Flight date: <span class="text-warning-emphasis" >${ formatDate(row[10]) }</span></div>
                          <div class="p-2 fst-italic">Theme: ${ themeColorbadges(row[11]) }  </div>
                     
                        </div>

                    </div>
                </div>
            </div>
        </div>


            `; // 
          } 
        },
        { data: 1, title: "Info" },
        { data: 6, title: "uuid",
        visible: false,
        searchable: false
      },
        

      ],
      data: dataSet,
      bDestroy: true,
      pageLength: 35,
     paging: true,
      select: true,
      scrollY: '77vh',
      info: true, // Hide the information about entries
      lengthMenu: [
        [18, 25, 50, -1],
        [18, 25, 50, 'All']
      ],
      // stripeClasses: ['stripe1', 'stripe2'],
      select: {
        style: 'multi',
        className: 'table-info',
        // selector: 'td:last-child a'
      }


    });



    // cick on table first row col only
    dataTB.on('dblclick', 'tbody td:first-child', function () {
      let data = dataTB.row($(this).closest('tr')).data();

      //alert('You clicked on ' + data[0] + "'s row");
      locateDroneonMap(([data[2], data[3]]).toString(), true);

    });



    // cick on table second row col only
    dataTB.on('click', 'tbody td:nth-child(2)', function () {
      let data = dataTB.row($(this).closest('tr')).data();

      // call the model
      modelparaSetting(data);

    });


    dataTB.on('click', 'tbody tr', function () {
   

      // disable the dynamic update of table 
      dynamicTableUpdateFlag = false;
      $(btnRemoveEdit.button).addClass('bg-info text-white ');

    });

///// to be start from here

// dataTB.on('select', function (e, dt, type, indexes) {
//   if (type === 'row') {
//       indexes.forEach(function(index) {
//           let hiddenColumnIndex = 3; // Index of the "hidden" column
//           let cellNode = dataTB.cell(index, hiddenColumnIndex).node();
//           let currentValue = $(cellNode).text(); // Use jQuery to get the cell's text content
//           let newValue = (currentValue === 'true') ? 'false' : 'true';
//           dataTB.cell(index, hiddenColumnIndex).data(newValue).draw(false);
//           $(cellNode).text(newValue);

//           console.log(newValue);
//       });
//   }
// });




    // cick on table second row col only
    // dataTB.on('click', 'tbody tr', function () {
    //   $("#droneList tbody tr").removeClass('row_selected');        
    //   $(this).addClass('row_selected');

    // });







  }





  // model parameter 
  const modelparaSetting = (data) => {
    $("#mapModelopt .modal-title").text(toTitleCase(data[0]));
    $("#mapModelopt .img-fluid").attr("src", data[4].length > 0 ? data[4][0] : '#');

    // store info at valaue

    // overlap image
    $("#btn_overlay").val(data[0]);

    //store latlon
    $("#btn_locate").attr("valuexy", [data[2], data[3]]);

    // geonode url
    $("#btn_detail").val(data[5]);


    $("#btn_locate").attr("uuid", data[6]);

    // store layer downlaod details
    $("#btn_download").val(data[7]);

    // store layer source GN DLB
    $("#btn_wms").val(data[8]);
    // store layer name
    $("#btn_wms").attr("value2", data[0]);


    // store layer source GN DLB
    $("#btn_share").val(data[8]);
    // store layer name
    $("#btn_share").attr("value2", data[0]);



    // disable DLG  btn and active GN btn
    if (data[8] == "GN_layer") {
      $('#btn_overlay').prop('disabled', false);
      $('#btn_detail').prop('disabled', false);
      $('#btn_wms').prop('disabled', false);
      $('#btn_share').prop('disabled', false);
    }
    if (data[8] == "DLB_layer") {
      $('#btn_overlay').prop('disabled', true);
      $('#btn_detail').prop('disabled', true);
      $('#btn_wms').prop('disabled', true);
      $('#btn_share').prop('disabled', true);
    }



    // show the data point model
    mapModel_Obj.show();
       


  }




  // dragable property for data info  model
  const mapModel_Obj = new bootstrap.Modal('#mapModelopt', {
    backdrop: false,
    keyboard: false,
    focus: false,


  });



// open model on click on seabe cradit
  $(document).on('click', '#creditBtn', function () {

    craditModel_Obj.show();

  });



  // dragable property for credit model
  const craditModel_Obj = new bootstrap.Modal('#userCraditModel', {
    backdrop: false,
    keyboard: false,
    focus: false,


  });


  // locate the drone on click


  $("#btn_locate").on("click", function () {

    locateDroneonMap($(this).attr("valuexy"), true);
  });

  $("#btn_overlay").on("click", function () {

    addOverLay_to_map(this.value);


  });


  $("#btn_detail").on("click", function () {

    //window.location.href = this.value;
    window.open(this.value, '_blank');


  });

  const locateDroneonMap = (data, fly) => {

    let xy = data.split(",");

    if (fly) {

      map.flyTo([xy[0], xy[1]], 19);
    }


    if (circleMarker) {
      map.removeLayer(circleMarker);

    }

    sleep(fly ? 2000 : 100).then(() => {

      circleMarker = L.circleMarker([xy[0], xy[1]], {
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



  const addOverLay_to_map = (val) => {

    if (map.hasLayer(GN_Overlay_layer)) {
      map.removeLayer(GN_Overlay_layer);
    }

    GN_Overlay_layer.wmsParams.layers = `geonode:${val}`;
    map.addLayer(GN_Overlay_layer);
    GN_Overlay_layer.redraw();
    GN_Overlay_layer.bringToFront();

  }



  map.on("baselayerchange", () => {

    if (map.hasLayer(GN_Overlay_layer)) {
      GN_Overlay_layer.bringToFront();
    }
  })

  if (map.hasLayer(GN_Overlay_layer)) {
    GN_Overlay_layer.bringToFront();
  }




  map.on('moveend', function () {

    // update the list basd on map extent
    let visibleBounds = map.getBounds();
    let markerInMap = [];
    let droneDataTableUpdated = null;

    if (dynamicTableUpdateFlag) {
      markersAll.eachLayer(
        function (ma) {
          if (visibleBounds.contains(ma.getLatLng())) {

            markerInMap.push(ma.options.uuid);

          }
        });


      droneDataTableUpdated = droneDataTable.filter(val => {

        return markerInMap.includes(val[6]);
      });


      //console.log(droneDataTableUpdated);

      updateDataTable(droneDataTableUpdated);

    }


           // enable the dynamic update of table 
           dynamicTableUpdateFlag = true;
           $(btnRemoveEdit.button).removeClass('bg-info text-white ');


          // update table on move end
          updateMapStateInfo(droneDataTableUpdated);
          




  });



updateMapStateInfo = (droneDataTableUpdated) => {

  let themeTypeIndex =11; // it hold the theme attribute index

  // hold the count of the theme
  let themeTypeCounts = {
      'Habitat': 0,
      'Seabirds': 0,
      '': 0
  };

  // hold the area of the theme
  let themeTypeAreas = {
    'Habitat': 0,
    'Seabirds': 0,
    '': 0
};
  
  droneDataTableUpdated.forEach(item => {
      let themeType = item[themeTypeIndex];
      if (themeTypeCounts.hasOwnProperty(themeType)) {
          themeTypeCounts[themeType]++; //comput the count
          themeTypeAreas[themeType] += item[12]; // compute the area
          
      }
      
  });
  


// update the polar chart
updatePolarChart(themeTypeAreas);

// update the bar chart
updateBarChart(themeTypeCounts)

}




// ###############  initialize the polar chart ##################

// Assuming you have a canvas with id 'chart_areaStat'
let ctxPolar = document.getElementById('chart_areaStat');

// Initial data
let dataPolar = {
    labels: ['Habitat', 'Seabirds', 'Others'],
    datasets: [{
        data: [0, 0, 0], // initial data
        backgroundColor: ['rgba(68, 156, 115, 0.80)', 'rgba(153, 232, 249, 0.80)', 'rgba(138, 140, 142, 0.80)']
    }]
};

// Create the area chart
let ChartPolar = new Chart(ctxPolar, {
    type: 'polarArea',
    data: dataPolar,
    options: {
        responsive: true,
        maintainAspectRatio: true, // set to false to fill the container
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                
            },
            title: {
                display: true,
                text: 'Area under different theme sqkm',
                color: '#052C65',
            },
        },
        scales: {
            r: {
                ticks: {
                    beginAtZero: true
                },
                reverse: false
            }
        },
        animation: {
            animateRotate: false,
            animateScale: true
        }
    }
});

// Function to update the chart
updatePolarChart = (newData)=> {

let newDataObj = Object.values(newData); // extract the values from the object
ChartPolar.data.datasets[0].data = newDataObj; // update data
ChartPolar.update(); // update the chart

}

// ###############   the polar chart end ##################



// ################ initialize the bar chart ##################

// Assuming you have a canvas with id 'chart_areaStat'
let ctxCount = $('#chart_countStat');

// Initial data
let dataBar = {
    labels: ['Habitat', 'Seabirds', 'Others'],
    datasets: [{
        data: [0, 0, 0], // initial data
        backgroundColor: ['rgba(68, 156, 115, 0.80)', 'rgba(153, 232, 249, 0.80)', 'rgba(138, 140, 142, 0.80)']
    }]
};

// Create the chart
let ChartBar = new Chart(ctxCount, {
    type: 'bar',
    data: dataBar,
    options: {
        responsive: true,
        indexAxis: 'y',
        maintainAspectRatio: false, // set to false to fill the container
        plugins: {
            legend: {
                display: false,
             
                
            },
            title: {
                display: true,
                text: 'Number of drone images under theme',
                color: '#052C65',
            },
        },
        scales: {
            y: {
                ticks: {
                    beginAtZero: true
                }
            }
        },
        animation: {
            animateRotate: false,
            animateScale: true
        }
    }
});

// Function to update the chart
updateBarChart = (newData)=> {

let newDataObj = Object.values(newData); // extract the values from the object
ChartBar.data.datasets[0].data = newDataObj; // update data
ChartBar.update(); // update the chart

}

// ################   the bar chart end ##################




  // map on zoom out
let previousZoomLevel = map.getZoom();

map.on('zoomend', function() {
    let currentZoomLevel = map.getZoom();

    if (currentZoomLevel < previousZoomLevel) {
         // enable the dynamic update of table 
      dynamicTableUpdateFlag = true;
      $(btnRemoveEdit.button).removeClass('bg-info text-white ');
    }

    previousZoomLevel = currentZoomLevel;
});




  map.on('click', function () {
    // clear selection
    if (circleMarker) {
      map.removeLayer(circleMarker);

    }

  });








  $("#btn_download").on("click", function () {

    let container = document.createElement("div");
    container.innerHTML = this.value;
    container = container.querySelectorAll("td");

    if (container.length > 0) {
      container = container[0].innerText;
      let bucket = container.split("/")[0]

      let flipath = container.split("/").slice(1).join("/");
      flipath = flipath + "/orthophoto/" + container.split("/").pop() + ".tif"

      console.log(flipath);


      let url = `/api/droneViz/minio/${bucket}/${flipath}`;

      // Make a GET request using the fetch API
      fetch(url)
        .then(response => {
          // Check if the response status is OK (200)
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          // Parse the response as JSON
          return response.json();
        })
        .then(data => {
          // Process the fetched data



          // Create a download link
          let link = document.createElement('a');
          link.href = data; // Create a temporary URL for the Blob
          link.download = container.split("/").pop() + ".tif";
          document.body.appendChild(link);

          // Trigger a click on the link to start the download
          link.click();

          // Remove the link from the DOM
          document.body.removeChild(link);




        })
        .catch(error => {
          // Handle errors
          console.error('Fetch error:', error);
        });





    }
    else {

      $.confirm({
        title: '<i class="bi bi-exclamation-triangle"></i> Not Available!',
        content: "The data you're searching for is currently unavailable.",
        type: 'orange',
        typeAnimated: true,
        buttons: {
          tryAgain: {
            text: 'Close',
            btnClass: 'btn-info',
            action: function () {
            }
          },

        }
      });

    }









  });



  //tool tip of the disable btn
  if (!isAuthenticated) {


    const tooltip = new bootstrap.Tooltip('#btn_download_disable', {
      boundary: document.body // or document.querySelector('#boundary')
    });

  }


  $("#btn_wms").on("click", function () {

    if (this.value == 'GN_layer') {

      $.confirm({
        title: '<i class="bi bi-info-square"></i> WMS details',
        content: `<div class="overflow-hidden">
      <p>The parameters for connecting to the map server via WMS are as follows:  </p>
      <ul>
      <li style="word-wrap: break-word;"><b>Host Url</b>:<br/><span class="text-primary small text-decoration-underline">https://geonode.seabee.sigma2.no/geoserver/ows?SERVICE=WMS</spam></li> 
      <li style="word-wrap: break-word;"><b>Layer name</b>:<br/><span class="text-primary small text-decoration-underline"> geonode:${$(this).attr("value2")}</spam></li>    
      </ul>
    
      </div>`,
        type: 'orange',
        typeAnimated: true,
        buttons: {
          tryAgain: {
            text: 'Close',
            btnClass: 'btn-info',
            action: function () {
            }
          },

        }
      });

    }





  });


  $("#btn_share").on("click", function () {

    if (this.value == 'GN_layer') {

      $.confirm({
        title: '<i class="bi bi-share-fill"></i> Share URL',
        content: `<p>Please copy the shared link:  
      
      
      </p>
      <div style="word-wrap: break-word;">
      <span id="btn_sharedURL" style="font-size:12px" class="text-primary  text-decoration-underline">https://geonode.seabee.sigma2.no/datasets/geonode:${$(this).attr("value2")}/embed</span>
      <button 
      id="btn_copy_sharedLink"
     type="button" class="btn btn-light btn-sm border rounded-circle">
      <i class="bi bi-clipboard" ></i>
    </button>
      </div>    
     
    `,
        type: 'orange',
        typeAnimated: true,
        buttons: {
          tryAgain: {
            text: 'Close',
            btnClass: 'btn-info',
            action: function () {
            }
          },

        }
      });



    }





  });


  $("#btn_clear").on("click", function () {

    if (map.hasLayer(GN_Overlay_layer)) {
      map.removeLayer(GN_Overlay_layer);
    }

    if (circleMarker) {
      map.removeLayer(circleMarker);

    }

  

  });


  // function to copy url to clip board
  $(document).on('click', '#btn_copy_sharedLink', function () {




    let textToCopy = $("#btn_sharedURL").text();
    const $tempInput = $("<input>").val(textToCopy).appendTo("body").select();
    document.execCommand("copy");
    $tempInput.remove();



  });


  // clcik the marker and select the rwo
  markersAll.on('click', function (ev) {

    let uuid = ev.layer.options.uuid;


    //desect previus row
    dataTB.rows().deselect();


    // get the index number
    let indexID = dataTB
      .column(2)
      .data()
      .filter(function (value) {
        return value === uuid;
      })
      .map(function (filteredValue) {
        return dataTB.column(2).data().indexOf(filteredValue);
      })[0];

    //select the row
    dataTB.row(`:eq(${indexID})`).select();

    // find the page 
    let pageLength = dataTB.page.len();
    let pageNumber = Math.floor(indexID / pageLength);
    dataTB.page(pageNumber).draw('page');

  });


  const selectRowofTable = () => {


  }


  $("#mapModelopt").draggable({
    handle: ".modal-dialog"
});


// theme selection value
$('#divTheme input[name="btnradioTheme"]').on('change', function() {
 

  filterTableMap(this.id);

});



});


// tigger tour 
$("#li_tourIntro").on("click", function (e) {


 driverObj.drive();

// Start auto-advancing through the steps
(async function() {
  for (let item of stepsIntro) {
    await sleep(3000);
    driverObj.moveNext();
  }
})();

 


});





// function to filter the table and map
const filterTableMap = (str) => {

  let orginalData = [...dataGNmain];
  let tabData = null;


if (str == "inputSeabirs"){
  
  tabData = orginalData.filter((el) => {
    return el['theme'] == "Seabirds";
  });

  markerFunctionForGN(tabData);

}

else if (str == "inputHabitat"){
  

  tabData = orginalData.filter((el) => {
    return el['theme'] == "Habitat";
  });

  markerFunctionForGN(tabData);


}
else if (str == "inputOther"){

  tabData = orginalData.filter((el) => {
    return el['theme'].length < 1;
  });

  markerFunctionForGN(tabData);


}

else {

  markerFunctionForGN(orginalData);
}


}



// string to title case
const toTitleCase = (str)=> {

  return str.replace(/_/g, ' ')
  .toLowerCase().split(' ')
  .map(word => word.charAt(0)
  .toUpperCase() + word.slice(1)).join(' ');
}



const formatDate = (dateStr) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let date = new Date(dateStr);

  let day = date.getDate();
  let month = months[date.getMonth()];
  let year = date.getFullYear();

  // Pad the day with a leading zero if necessary
  day = day < 10 ? '0' + day : day;

  return `${day}${month}${year}`;
}


const themeColorbadges  = (themeVal) => {

let theme = themeVal.toLowerCase();

switch (theme) {
  case "seabirds":
    return `<span class="badge rounded-pill bg-info-subtle  text-success-emphasis">${toTitleCase(theme)}</span>`;
    break;
  case "habitat":
    return `<span class="badge rounded-pill text-bg-success" style="--bs-bg-opacity: .8;">${toTitleCase(theme)}</span>`;
    break;
  default:
    return `<span class="badge rounded-pill text-bg-dark" style="--bs-bg-opacity: .5;">Other</span>`;
}

}