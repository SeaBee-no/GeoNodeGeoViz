//Global variable and functions
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// before page load
window.onload = function (e) {
  // fix to the base template
  $.backstretch("destroy", 0);
};

//get the base url of the current page
const baseUrl = window.location.origin;

//drone logo
const droneIcone = L.icon({
  iconUrl: baseUrl + "/static/ddc/dmc/img/landed.png",
  iconSize: [50, 70],
  iconAnchor: [25, 65],
  // shadowAnchor: [4, 62],
  popupAnchor: [-3, -76],
});

// initialize the map
let map_projArea = null;
let map_proLoca = null;
let gp_layer_projArea = null;
let gp_layer_proLoca = null;
let flightGUID = "";
let missionName ="";

$(window).on("map:init", function (e) {
  //get the map refrence
  var detail = e.originalEvent ? e.originalEvent.detail : e.detail;

  if (detail.id == "id_project_area_coordinates-map") {
    map_projArea = detail.map;
    gp_layer_projArea = L.featureGroup().addTo(map_projArea);
  }

  if (detail.id == "id_project_location_coordinates-map") {
    map_proLoca = detail.map;
    gp_layer_proLoca = L.featureGroup().addTo(map_proLoca);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // fix to the base template
  document.querySelectorAll(".tm-bg").forEach((el) => el.remove());
  document.querySelectorAll(".tm-bg-controls-wrapper")[0].remove();

  //#######################################

  var btnSave = $(
    '<button id="btn_saveData" class= "btn btn-info btn_saveData_extraClass"  type="submit" value="Save"></button>'
  )
    .text("Save")
    .on("click", (e) => {
      e.preventDefault();

      if (
        !($('input[name="drone_type"]:checked').val() == undefined) &&
        !(flightGUID.length == 0)
      ) {
        $.getJSON(
          `${window.location.origin}/api/ddcregcheck/${flightGUID}`,
          function (data) {
            if (data.response == "not_found") {
              add_dronelogbook_record();
            }
            if (data.response == "found") {
              update_dronelogbook_record();
            }
          }
        ).fail(function (xhr, status, error) {
          console.log("Error: " + status + " - " + error);
        });
      } else {
        $.confirm({
          title:
            '<span class="text-danger"><b>Encountered an error!</b></span>',
          content:
            '<span class="text-dark">Both the field <b>*Flight Mission</b>and <b>*Drone Type</b> must be selected.</span>',
          type: "red",
          typeAnimated: true,
          buttons: {
            tryAgain: {
              text: "Close",
              btnClass: "btn-red",
              action: function () {},
            },
          },
        });
      }
    });

  // gather all parameter for dronelogbook to update or create
  const gatherFormpara_dronlogbook = () => {


    //let projectFolderName = $("#id_mision_name").val()+"_"+ $("#id_flight_datetime").val().replace(/[-: ]/g, '').slice(0, -2);
    let para = {
      drone_type: $('input[name="drone_type"]:checked').val(),
      flight_mission_guid: flightGUID,
      flight_mission_name: $("#id_mision_name").val(),
      image_overlap: $("#id_image_overlap").val(),
      sensor_dates_last_calibration: $("#id_sensor_info_dates_last_calibration")
        .val()
        .replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2"),
      sensor_dates_last_maintenance: $("#id_sensor_info_dates_last_maintenance")
        .val()
        .replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2"),
      secchi_depth: $("#id_secchi_depth").val(),
      turbidity: $("#id_turbidity").val(),
      salinity: $("#id_salinity").val(),
      water_temperature: $("#id_water_temperature").val(),
      cdom: $("#id_cdom").val(),
      //csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
    };

    Object.keys(para).forEach(
      (key) => (para[key] == null || para[key] === "") && delete para[key]
    );
    return para;
  };

  const add_dronelogbook_record = () => {
    //####
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: `/api/ddcreg/`,
      data: JSON.stringify(gatherFormpara_dronlogbook()),
      headers: {
        "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[0]
          .value,
      },
      success: function (response) {
        $.confirm({
          title: '<span class="text-success"><b>successful!</b></span>',
          content:
            '<span class="text-dark">Data has been store successfully</span>',
          type: "green",
          typeAnimated: true,
          buttons: {
            tryAgain: {
              text: "Close",
              btnClass: "btn-green",
              action: function () {},
            },
          },
        });
      },
      error: function (jqXHR) {
        console.log(jqXHR);
        $.confirm({
          title: '<span class="text-danger"><b>Unsuccessful!</b></span>',
          content:
            '<span class="text-dark">Error while saving data in database.</span>',
          type: "red",
          typeAnimated: true,
          buttons: {
            tryAgain: {
              text: "Close",
              btnClass: "btn-red",
              action: function () {},
            },
          },
        });
      },
    });
    //###
  };

  const update_dronelogbook_record = () => {
    $.ajax({
      type: "PUT",
      contentType: "application/json",
      url: `/api/ddcreg/${flightGUID}/`,
      data: JSON.stringify(gatherFormpara_dronlogbook()),
      headers: {
        "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[0]
          .value,
      },
      success: function (response) {
        $.confirm({
          title: '<span class="text-success"><b>successful!</b></span>',
          content:
            '<span class="text-dark">Data has been updated successfully</span>',
          type: "green",
          typeAnimated: true,
          buttons: {
            tryAgain: {
              text: "Close",
              btnClass: "btn-green",
              action: function () {},
            },
          },
        });
      },
      error: function (jqXHR) {
        console.log(jqXHR);
        $.confirm({
          title: '<span class="text-danger"><b>Unsuccessful!</b></span>',
          content:
            '<span class="text-dark">Error while saving data in database.</span>',
          type: "red",
          typeAnimated: true,
          buttons: {
            tryAgain: {
              text: "Close",
              btnClass: "btn-red",
              action: function () {},
            },
          },
        });
      },
    });
  };

  var btnList = $(
    '<button class= "btn btn-info" value="Input"  type="button"><i class="fas fa-solid  fa-list-ol"></i></button>'
  ).on("click", (e) => {
    e.preventDefault();
    window.location.href = "/ddclist";
  });

  $("#smartwizard").smartWizard({
    selected: 0, // Initial selected step, 0 = first step
    theme: "dots", // theme for the wizard, related css need to include for other than default theme
    justified: true, // Nav menu justification. true/false
    darkMode: false, // Enable/disable Dark Mode if the theme supports. true/false
    autoAdjustHeight: true, // Automatically adjust content height
    cycleSteps: false, // Allows to cycle the navigation of steps
    backButtonSupport: true, // Enable the back button support
    enableURLhash: true, // Enable selection of the step based on url hash
    transition: {
      animation: "fade", // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
      speed: "400", // Transion animation speed
      easing: "", // Transition animation easing. Not supported without a jQuery easing plugin
    },
    toolbarSettings: {
      toolbarPosition: "top", // none, top, bottom, both
      toolbarButtonPosition: "right", // left, right, center
      showNextButton: true, // show/hide a Next button
      showPreviousButton: true, // show/hide a Previous button
      toolbarExtraButtons: [btnSave, btnList], // Extra buttons to show on toolbar, array of jQuery input/buttons elements
    },
    anchorSettings: {
      anchorClickable: true, // Enable/Disable anchor navigation
      enableAllAnchors: false, // Activates all anchors clickable all times
      markDoneStep: true, // Add done state on navigation
      markAllPreviousStepsAsDone: true, // When a step selected by url hash, all previous steps are marked done
      removeDoneStepOnNavigateBack: false, // While navigate back done step after active step will be cleared
      enableAnchorOnDoneStep: true, // Enable/Disable the done steps navigation
    },
    keyboardSettings: {
      keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
      keyLeft: [37], // Left key code
      keyRight: [39], // Right key code
    },
    lang: {
      // Language variables for button
      next: "Next",
      previous: "Previous",
    },
    disabledSteps: [], // Array Steps disabled
    errorSteps: [], // Highlight step with errors
    hiddenSteps: [], // Hidden steps
  });

  //#################################

  // force to mutiselect to single
  $("#id_mision_name_list").on("click", "option", function (event) {
    $("#smartwizard").smartWizard("loader", "show");

    flightGUID = $("#id_mision_name_list").find(":selected").val();
    missionName= $("#id_mision_name_list").find(":selected").text();
    // tigger to update the dataupload form
    updateDownloadStepEntries();

    $.getJSON(
      `${window.location.origin}/api/ddcregcheck/${flightGUID}`,
      (event) => {
        data = event.data;

        let da_drone_type =
          event.response == "found" && data.drone_type != null ? data : null;

        da_drone_type != null
          ? $(`input[name='drone_type'][value='${data.drone_type}']`).prop(
              "checked",
              true
            )
          : $("input[name='drone_type']").prop("checked", false);

        $("#id_image_overlap").val(
          event.response == "found" && data.image_overlap != null
            ? data.image_overlap
            : null
        );

        $("#id_sensor_info_dates_last_calibration").val(
          event.response == "found" &&
            data.sensor_dates_last_calibration != null
            ? data.sensor_dates_last_calibration.replace(
                /(\d{4})-(\d{2})-(\d{2})/,
                "$2/$3/$1"
              )
            : null
        );

        $("#id_sensor_info_dates_last_maintenance").val(
          event.response == "found" &&
            data.sensor_dates_last_maintenance != null
            ? data.sensor_dates_last_maintenance.replace(
                /(\d{4})-(\d{2})-(\d{2})/,
                "$2/$3/$1"
              )
            : null
        );

        $("#id_secchi_depth").val(
          event.response == "found" && data.secchi_depth != null
            ? data.secchi_depth
            : null
        );

        $("#id_turbidity").val(
          event.response == "found" && data.turbidity != null
            ? data.turbidity
            : null
        );

        $("#id_salinity").val(
          event.response == "found" && data.salinity != null
            ? data.salinity
            : null
        );

        $("#id_water_temperature").val(
          event.response == "found" && data.water_temperature != null
            ? data.water_temperature
            : null
        );

        $("#id_cdom").val(
          event.response == "found" && data.cdom != null ? data.cdom : null
        );

        // clear the previous layers from group layer
        if(gp_layer_projArea){
          gp_layer_projArea.clearLayers();
        }
        
        if(gp_layer_proLoca){
          gp_layer_proLoca.clearLayers();
        }
        

        if (1 <= $(this).siblings(":selected").length) {
          //$(this).removeAttr("selected");
          $(this).prop("selected", false);
        }

        get_flightdataByGUID(
          "flight",
          $("#id_mision_name_list").find(":selected").val(),
          function (returndata_flight) {
            // Flight level data
            let flight = returndata_flight;
            console.log(flight);

            //store flight drone
            flightGUID = flight.guid;

            //select project info
            $("#id_project_location_name").val(flight.place_name);

            // form Mission Info #####
            $("#id_mision_name").val(flight.name);
            $("#id_flight_datetime").val(flight.flight_date);
            $("#id_flight_altitude").val(flight.max_altitude_agl);
            $("#id_flight_duration").val(flight.duration_seconds);

            //Enviromental  Info #####
            $("#id_cloud_cover").val(flight.weather_detail.CC);
            $("#id_humidity").val(flight.weather_detail.H);
            $("#id_air_temperature").val(flight.weather_detail.T);
            $("#id_wind_speed").val(flight.weather_detail.W == null?'':flight.weather_detail.W.split("(")[0]);
            $("#id_wind_direction").val(
              flight.weather_detail.W.split("(").length < 1  ? flight.weather_detail.W.split("(")[1].slice(0, -1) :'' 
              );
            $("#id_sun_time").val(flight.sun_time);

            flight.data_plan_area &&  flight.data_plan_area.forEach((element) => {
              let validJson = true;
              element.geometry.forEach(function (c) {
                if (
                  isNaN(c[0]) ||
                  isNaN(c[1]) ||
                  c[0] < -90 ||
                  c[0] > 90 ||
                  c[1] < -180 ||
                  c[1] > 180
                ) {
                  validJson = false;
                }
              });
              let el = null;
              if (validJson) {
                el = L.polyline(L.GeoJSON.coordsToLatLngs(element.geometry), {
                  color: "#0080FF",
                  weight: 4,
                  opacity: 0.8,
                });
                gp_layer_projArea.addLayer(el);
              }

              if (!validJson) {
                el = element.geometry.map((coords) =>
                  coords.map((coord) => coord.reverse())
                );
                el = L.polyline(el, {
                  color: "#FFFF00",
                  weight: 2,
                  opacity: 0.5,
                });
                // console.log(el);
                gp_layer_projArea.addLayer(el);
              }
            });



            //###########################
            let tasks_equipment = [];
            flight.equipments.forEach((el) => {
              tasks_equipment.push(
                new Promise((resolve, reject) => {
                  get_flightdataByGUID(
                    "equipment",
                    el,
                    function (returndata_equipment) {
                      resolve(returndata_equipment);
                    }
                  );
                })
              );
            });

            let tasks_drone = [];
            Promise.all(tasks_equipment).then((equipmentList) => {
              // console.log(equipmentList);

              $("#sensorInfoList").empty();

              equipmentList.forEach((el) => {
                if (el.drone_guid && el.drone_guid.length > 0) {
                  tasks_drone.push(
                    new Promise((resolve, reject) => {
                      get_flightdataByGUID(
                        "drone",
                        el.drone_guid,
                        function (returndata_drone) {
                          resolve(returndata_drone);
                        }
                      );
                    })
                  );
                }
                if (el.is_battery == "0") {
                  $("#sensorInfoList").append(
                    `<li class="list-group-item"> <b>Equipment:</b> ${el.equipment_type}   <b>Detail:</b> ${el.name}</li>`
                  );
                }
              });

              Promise.all(tasks_drone).then((droneList) => {
                $("#droneInfoList").empty();

                // get the unique drone by sirial number
                droneList = [
                  ...droneList.filter(
                    (a, i) =>
                      droneList.findIndex(
                        (s) => a.serial_numner === s.serial_numner
                      ) === i
                  ),
                ];

                droneList.forEach((el) => {
                  $("#droneInfoList").append(
                    `<li class="list-group-item"><b>Drone name:</b> ${el.name}</li>`
                  );
                  $("#droneInfoList").append(
                    `<li class="list-group-item"> <b>Brand:</b> ${el.brand} </h5></li>`
                  );
                  $("#droneInfoList").append(
                    `<li class="list-group-item"> <b>Drone type:</b> ${el.drone_type} </h5></li>`
                  );
                  $("#droneInfoList").append(
                    `<li class="list-group-item"> <b>Model:</b> ${el.model} </h5></li>`
                  );
                  $("#droneInfoList").append(
                    `<li class="list-group-item"> <b>Serial number:</b> ${el.serial_number} </h5></li>`
                  );

                  $("#droneInfoList").append(
                    `<li class="list-group-item" style="background: transparent;"></li>`
                  );
                });
              });
            });

            //********************** /
            get_flightdataByGUID(
              "place",
              flight.place_guid,
              function (returndata_place) {
                // Flight level data
                let place = returndata_place;

                if(place != 'NA'){
                gp_layer_proLoca.addLayer(
                  new L.marker([place.latitude, place.longitude], {
                    icon: droneIcone,
                  })
                );
              } else
              {

                $.confirm({
                  title: '<span class="text-success"><b>Not Found!</b></span>',
                  content:
                    '<span class="text-dark">GPS reading for the current location not found </span>',
                  type: "orange",
                  typeAnimated: true,
                  buttons: {
                    tryAgain: {
                      text: "Close",
                      btnClass: "btn-orange",
                      action: function () {},
                    },
                  },
                });
              }


                sleep(2000).then(() => {
                  $("#smartwizard").smartWizard("loader", "hide");
                  
                  if(place != 'NA'){
                  map_proLoca.fitBounds(gp_layer_proLoca.getBounds());
                  map_proLoca.zoomOut(18);
                  }
                  sleep(5000).then(() => {
                    map_projArea.fitBounds(gp_layer_projArea.getBounds());
                  
                  });
                });
               
                //********************** /
              }
            );
          }
        );
      }
    ).fail(function (xhr, status, error) {
      console.log("Error: " + status + " - " + error);
    });
  });

  // update the form value
  const get_flightdataByGUID = (flight, guid, callback) => {
   
   
    $.getJSON(
      `${window.location.origin}/api/flight/${flight}/${guid}`,
      function (data) {

        // if (flight == "flight"){
        //   console.log(flight);
        //  }
        callback(data === 'NA' ? data:data[0] );
      
      
      }
    );
 
 
  };

  //initialize the leaflet form contro
  sleep(100).then(() => {
    if (!$(".leaflet-draw-section").hasClass("d-none")) {
      $(".leaflet-draw-section").addClass("d-none");
    }
  });
  let executedmapZoomForm2 = false;
  $("#smartwizard").on(
    "showStep",
    function (e, anchorObject, currentStepIndex, stepDirection) {
      if (currentStepIndex == 1) {
        // validate the map
        map_projArea.invalidateSize();

        // code block to be executed only once
        if (!executedmapZoomForm2) {
          map_projArea.fitBounds(gp_layer_projArea.getBounds());
         // console.log("I am in");
          executedmapZoomForm2 = true;
        }
      }
      if (currentStepIndex == 0) {
        // validate the map
        map_proLoca.invalidateSize();
      }
    }
  );

  sleep(1000).then(() => {
    // bootstap date picker take time to configure properly while loading the teh applicatiopn
    $("#id_sensor_info_dates_last_calibration").attr("disabled", true);
    $("#id_sensor_info_dates_last_maintenance").attr("disabled", true);
  });

  // will exicute once when page is loded fully
  let guid = new URLSearchParams(location.search).get("guid");

  onloadMissionListClick(guid);

  // click on download
  $(".DownloadIcone").click((el) => {
    let val = $(el.currentTarget).attr("data-url");
    val = val.split("?")[0].split("geoviz-upload-data/")[1].split('/').join('£¤');

    //val.length > 0 ? window.open(val):null;

    $.getJSON(
      `${window.location.origin}/api/miniodownload/${val}`,
      function (data) {
        data.length > 0 ? window.open(data) : null;
      }
    ).fail(function (xhr, status, error) {
      console.log("Error: " + status + " - " + error);
    });
  });

  // click to del
  $(".TrashIcone").click((el) => {
    let modelFiledName = $(el.currentTarget).attr("model_field");
    let urldata = $(el.currentTarget).prev().attr("data-url");

    if (urldata != null && urldata.length > 0) {
      $.confirm({
        title: '<span class="text-danger"><b>Warnning!</b></span>',
        content:
          '<span class="text-dark">"Are you sure you want to delete this data? <br/>This action cannot be undone.</span>',
        type: "red",
        typeAnimated: true,
        buttons: {
          confirm: {
            text: " ok ",
            btnClass: "btn-red",
            action: function () {
              del_upload_file(modelFiledName);

              $(el.currentTarget).prev().attr("data-url", "");

              $(`#id_${modelFiledName}`).val(null);

              $($(`#id_${modelFiledName}`).next("label")[0]).text("---");
            },
          },
          cancel: {
            text: "Cancel",
            btnClass: "btn-green",
            action: function () {
              // do something
            },
          },
        },
      });
    }
  });

  // uplish to geonode
  $(".GeonodeIcone").click((el) => {
    let val = $(el.currentTarget)
      .parents("span")
      .find(".DownloadIcone")
      .first()
      .attr("data-url");
    val = val.split("?")[0].split("geoviz-upload-data/")[1].split('/').join('£¤');

    $(".GeonodeIcone").toggleClass("fa-map");
    $(".GeonodeIcone").toggleClass("fa-sync fa-spin");

    $.confirm({
      title: '<span class="text-info"><b>Publish map!</b></span>',
      content:
        '<span class="text-dark">"Are you sure you want to publish this raster? <br/>This might take a few sec to a few minutes depending on the size of the data.</span>',
      type: "blue",
      typeAnimated: true,
      buttons: {
        confirm: {
          text: " ok ",
          btnClass: "btn-green",
          action: function () {
            $.getJSON(
              `${window.location.origin}/api/geonodepublish/${val}`,
              function (data) {
                
               if(data.status == 200){
                
                $(".GeonodeIcone").toggleClass("fa-map");
                $(".GeonodeIcone").toggleClass("fa-sync fa-spin");
               } else{
                
                $(".GeonodeIcone").toggleClass("fa-exclamation-triangle");
                $(".GeonodeIcone").toggleClass("fa-sync fa-spin");

               }
              
              
              }
            ).fail(function (xhr, status, error) {
              console.log("Error: " + status + " - " + error);
            });
          },
        },
        cancel: {
          text: "Cancel",
          btnClass: "btn-red",
          action: function () {
            $(".GeonodeIcone").toggleClass("fa-map");
            $(".GeonodeIcone").toggleClass("fa-sync fa-spin");
          },
        },
      },
    });
  });

  /*
  const getJobStatus = (el) => {
    let intervalID = setInterval(function () {
      // Your code to run every second
      $.getJSON(
        `${window.location.origin}/api/jobstatus/${el.jobid}`,
        function (data) {
          if (data.status == "FINISHED") {
            clearInterval(intervalID);
            $(".GeonodeIcone").toggleClass("fa-map");
            $(".GeonodeIcone").toggleClass("fa-sync fa-spin");
          }
        }
      ).fail(function (xhr, status, error) {
        console.log("Error: " + status + " - " + error);
      });
    }, 4000);
  };
*/

// minio_client.copy_object(
//   'dmc',
//   'test/images1234.zip',
//   CopySource('geoviz-upload-data','niva/2023/Olbergholmen,_LARVIK/raw_images/images123.zip')
//    )

$("#cloud_process_publish").on('click',()=>{
  let timestem = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
  let zipimgUrl=decodeURIComponent($("#cloud_processing_img").attr("data-url"));
  let configUrl=decodeURIComponent($("#cloud_processing_config").attr("data-url"));
  
  if(zipimgUrl.length > 0 && configUrl.length > 0){

  let projectFolder= $("#id_mision_name").val()+"_"+timestem;

  let src_bucket =   zipimgUrl.split("/")[3]
  let src_object_img= zipimgUrl.split("?")[0].split("/").slice(4).join("/")

  let dest_bucket =   'dmc'
  let dest_object_img =  zipimgUrl.split("?")[0].split("/");
  //dest_object_img = dest_object_img[dest_object_img.length -1]
  dest_object_img = `${projectFolder}/images.zip`


  

  let src_object_configyaml= configUrl.split("?")[0].split("/").slice(4).join("/")

  let dest_object_config =   configUrl.split("?")[0].split("/");
  //dest_object_config = dest_object_config[dest_object_config.length -1]
  dest_object_config = `${projectFolder}/config.seabee.yaml`


//###################

// push data to odm

$("#cloud_img_spin").removeClass("d-none");
  const url =  `${window.location.origin}/api/addtoodm/`;
  const data = {
    "src_bucket": src_bucket,
    "src_object_img": src_object_img,
    "dest_bucket": dest_bucket,
    "dest_object_img": dest_object_img,
    "src_object_configyaml": src_object_configyaml,
    "dest_object_config": dest_object_config
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken
    },
    body: JSON.stringify(data)
  })
  .then(response => {

      if (!response.ok) {
          throw new Error('Network response was not ok');
        }

      return response.json(); 
   
   
    }).then(data => {

      $.confirm({
        title: '<span class="text-success"><b>Successful!</b></span>',
        content:
          '<span class="text-dark">The data has been successfully added to the processing chain. Depending on the volume of data uploaded, it may take some time before it starts appearing in the Geoode raster catalog section.</span>',
        type: "green",
        typeAnimated: true,
        buttons: {
          tryAgain: {
            text: "Close",
            btnClass: "btn-green",
            action: function () {
              $("#cloud_img_spin").addClass("d-none");
            },
          },
        },
      });
   
   
   
    })
    .catch(error => {
      console.error("An error occurred:", error);
      $("#cloud_img_spin").addClass("d-none");
   
    });

}
else{
  $("#cloud_img_spin").addClass("d-none");


  $.confirm({
    title: '<span class="text-success"><b> Require a value in a field!</b></span>',
    content:
      '<span class="text-dark">In order to publish on the Geonode platform, you must provide both the zip file and the configuration file.</span>',
    type: "orange",
    typeAnimated: true,
    buttons: {
      tryAgain: {
        text: "Close",
        btnClass: "btn-orange",
        action: function () {},
      },
    },
  });


}
//##############


})













  // ###################   window load finish ##########################
});

// tigger the form based on mission id
const onloadMissionListClick = (val) => {
  if (val) {
    $("#smartwizard").smartWizard("loader", "show");
    $(`#id_mision_name_list option[value='${val}']`)
      .prop("selected", true)
      .click();
  }
};

$(".UploadIcone").on("click", function (ev) {
  let idObj = $(ev.currentTarget)
    .closest("div")
    .find("input.custom-file-input")[0].id;

  $(`#${idObj}`).click();
});

$(".edit-icon, .edit-icon-for-calander").on("click", function (ev) {
  let idObj = $(ev.currentTarget)
    .closest("div")
    .find("input.form-control")[0].id;
  $(`#${idObj}`).attr("disabled", !$(`#${idObj}`).attr("disabled"));
  $(ev.currentTarget).toggleClass("text-secondary");
});

$(".edit-icon-for-radio").on("click", function (ev) {
  let idObj = $(ev.currentTarget).closest("div").find(".form-group")[0].id;

  $(ev.currentTarget).toggleClass("text-secondary");

  $(`#${idObj}`)
    .find('input[type="radio"]')
    .attr(
      "disabled",
      $(`#${idObj}`).find('input[type="radio"]').attr("disabled") === "disabled"
        ? false
        : true
    );
});

// upload data to minio
$(".progress").hide();
$("#id_upload_data").click(function () {
  if (flightGUID.length > 0) {
    $(".progress").show();

    $.getJSON(
      `${window.location.origin}/api/uploadregcheck/${flightGUID}`,
      function (data) {
        if (data.response == "not_found") {
          let val = "/api/uploadreg/";
          uploadDataToMinio(val, "POST");
        }
        if (data.response == "found") {
          let val = `/api/uploadreg/${flightGUID}/`;
          uploadDataToMinio(val, "PUT");
        }
      }
    ).fail(function (xhr, status, error) {
      console.log("Error: " + status + " - " + error);
    });

    const uploadDataToMinio = (valUrl, regType) => {
      $.ajax({
        xhr: function () {
          var xhr = new XMLHttpRequest();
          xhr.upload.onprogress = function (e) {
            var percent = Math.round((e.loaded / e.total) * 100);
            $(".progress-bar")
              .width(percent + "%")
              .text(percent + "%");
          };
          return xhr;
        },
        type: regType,
        contentType: "application/json",
        url: valUrl,
        enctype: "multipart/form-data",
        data: getupload_FormData(),
        headers: {
          "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[0]
            .value,
        },
        contentType: false,
        processData: false,
        success: function (data) {
          $.confirm({
            title: '<span class="text-success"><b>successful!</b></span>',
            content:
              '<span class="text-dark">Data has been uploded successfully</span>',
            type: "green",
            typeAnimated: true,
            buttons: {
              tryAgain: {
                text: "Close",
                btnClass: "btn-green",
                action: function () {},
              },
            },
          });

          onloadMissionListClick(flightGUID);

          $(".progress").fadeOut();
        },
        error: function (error) {
          console.log("Error:", error);
        },
      });
    };
  }
});

const del_upload_file = (dronePath) => {
  $.ajax({
    url: `/api/uploadregdel/${flightGUID}/`,
    type: "DELETE",
    data: {
      field_to_delete: dronePath,
    },
    headers: {
      "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
    },
    success: function (data) {
      console.log("Data has been successfully deleted:", data);
    },
    error: function (error) {
      console.error("Error deleting data:", error);
    },
  });
};

const getupload_FormData = () => {

  //let timetem = $("#id_flight_datetime").val().replace(/[-: ]/g, '').slice(0, -2);
  let formData = new FormData();
  formData.append("flight_mission_guid", flightGUID);
  formData.append("flight_mission_name", missionName.split("----")[1].replace(/\s/g, "_"));
  //formData.append("flight_mission_name", projectFolderName.replace(/\s/g, "_"));
  formData.append(
    "mosaiced_image",
    $("#id_mosaiced_image")[0].files[0] != null
      ? $("#id_mosaiced_image")[0].files[0]
      : ""
  );
  formData.append(
    "row_image",
    $("#id_row_image")[0].files[0] != null ? $("#id_row_image")[0].files[0] : ""
  );

  formData.append(
    "configyaml",
    $("#id_configyaml")[0].files[0] != null
      ? $("#id_configyaml")[0].files[0]
      : ""
  );

  formData.append(
    "ground_control_point",
    $("#id_ground_control_point")[0].files[0] != null
      ? $("#id_ground_control_point")[0].files[0]
      : ""
  );
  formData.append(
    "ground_truth_point",
    $("#id_ground_truth_point")[0].files[0] != null
      ? $("#id_ground_truth_point")[0].files[0]
      : ""
  );
  formData.append(
    "dronePath",
    $("#id_dronePath")[0].files[0] != null ? $("#id_dronePath")[0].files[0] : ""
  );

  formData.append(
    "other",
    $("#id_other")[0].files[0] != null ? $("#id_other")[0].files[0] : ""
  );

  return formData;
};

// update the upload step entries

const updateDownloadStepEntries = () => {
  $.getJSON(
    `${window.location.origin}/api/uploadregcheck/${flightGUID}`,
    function (data) {
      if (data.response == "not_found") {
        update_download_record_notFound();
      }
      if (data.response == "found") {
        // reset data before update
        // update_download_record_notFound();

        update_download_record_found(data);
      }
    }
  ).fail(function (xhr, status, error) {
    console.log("Error: " + status + " - " + error);
  });
};

//reset all the donwload filed
const update_download_record_notFound = () => {
  $('#step-5 :input[type="file"]').each((index, el) => {
    $(el).val(null);
  });

  $("#step-5 .DownloadIcone").each((index, el) => {
    $(el).attr("data-url", "");
  });

  $("#step-5  .TrashIcone").each((index, el) => {
    $(el).attr("model_field", "");
  });

  $("#step-5  .custom-file-label").each((index, el) => {
    // $(el).attr("for",'');
    $(el).text("---");
  });
};

//update form  download form  if entries found
const update_download_record_found = (data) => {
  let da = Object.entries(data.data).map(([key, value]) => ({
    ["id_" + key]: value,
  }));

  $("#step-5 label.custom-file-label ").each((index, el) => {
    let valFor = $(el).attr("for");
    let dakey = Object.keys(
      da.find((object) => object.hasOwnProperty(valFor))
    )[0];
    let daval = Object.values(
      da.find((object) => object.hasOwnProperty(valFor))
    )[0];

    if (daval != null && valFor == dakey) {
      $(el).text(daval.split("?")[0].split("geoviz-upload-data/")[1].split("/").pop());
      $(`#div_${valFor}`)
        .parent("div")
        .children("span")
        .children(".DownloadIcone")
        .attr("data-url", daval);
      $(`#div_${valFor}`)
        .parent("div")
        .children("span")
        .children(".TrashIcone")
        .attr("model_field", valFor.split("id_").pop());
    }

    /// to be started
  });
};
