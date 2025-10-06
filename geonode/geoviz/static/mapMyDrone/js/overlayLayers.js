var markersAll = null;
var otterLayer = null;


var baseMaps = {

//  ########## base map Data ############    
    "ESRI WSM": L.tileLayer("https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg", {
      maxZoom: 19,
       attribution: '&copy;ESRI',
    }),
    "ArcGIS Grayscale": L.tileLayer(
      "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
      {
        maxZoom: 22,
        attribution: "&copy;ESRI",
      }
    ),
    "ESRI Imagery": L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 22,
        attribution: "&copy;ESRI",
      }
    ),
    "Google Satellite": L.tileLayer(
      "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      {
        maxZoom: 21,
        layers: "NA",
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy;Google",
      }
    ),

// ####################################
"NHM_DTM_TOPOBATHY": L.tileLayer.wms(
  "https://wms.geonorge.no/skwms1/wms.hoyde-dtm-nhm-topobathy-25833",
  {
    layers: "NHM_DTM_TOPOBATHY_25833:skyggerelieff", // or "NHM_DTM_TOPOBATHY_25833"
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    styles: "default",
    attribution: "&copy; Kartverket / Geonorge"
  }
),
"Marine bunnsedimenter":L.tileLayer.wms(
  "https://geo.ngu.no/mapserver/MarinBunnsedimenterWMS",
  {
    layers: [
      "Kornstorrelse_Ov",
     "Kornstorrelse_Reg",
      "Kornstorrelse_Det",
    ].join(","),
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    styles: "",          // leave blank -> default for each
    attribution: "&copy; NGU"
  }),

  "Naturtyper":L.tileLayer.wms('https://geo.ngu.no/mapserver/MarineGrunnkartWMS?', 
    {
  layers: "Naturtyper",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; NGU",

}),


"korall_områder": L.tileLayer.wms("https://kart.hi.no/mareano/mareano_biologi/korallrev_observert_rev/ows?", {
  layers: "korallrev_observert_rev",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; Havforskningsinstituttet"
}),
//  ########## marine base map Data vecter ############  

"BeachHelophyteVegetation": L.tileLayer.wms("https://kart.niva.no/geoserver/no.niva.public/wms?", {
  layers: "no.niva.public:BeachHelophyteVegetation_marint_naturkart",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; NIVA"
}),

"Saltmarsh_Marint_naturkart": L.tileLayer.wms("https://kart.niva.no/geoserver/no.niva.public/wms?", {
  layers: "no.niva.public:Saltmarsh_Marint_naturkart",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; NIVA"
}),
"ShallowSoftSed_Marine_naturkart": L.tileLayer.wms("https://kart.niva.no/geoserver/no.niva.public/wms?", {
  layers: "no.niva.public:ShallowSoftSed_Marine_naturkart",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; NIVA"
}),
// "DEM25Norge_marint_naturkart_uint16": L.tileLayer.wms("https://kart.niva.no/geoserver/no.niva.public/wms?", {
//   layers: "no.niva.public:DEM25Norge_marint_naturkart_uint16",
//   format: "image/png",
//   transparent: true,
//   version: "1.3.0",
//   attribution: "&copy; NIVA"
// }),
"tempmean_marint_naturkart_uint16": L.tileLayer.wms("https://kart.niva.no/geoserver/no.niva.public/wms?", {
  layers: "no.niva.public:tempmean_marint_naturkart_uint16",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; NIVA"
}),
"nin_grunntyper_polygon": L.tileLayer.wms("https://kart.hi.no/mareano/magik/nin_grunntyper_polygon/wms", {
  layers: "nin_grunntyper_polygon",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  attribution: "&copy; HI"
}),



}


  

  overlayMaps = {
    "<img class='pb-2' width='30px' src='../static/mapMyDrone/img/seabeeLogo.png' alt='...'>  Drone flight":
      markersAll,
    "<img class='pb-2' width='40px' src='../static/mapMyDrone/img/otter_drone.png' alt='...'>Otter mission":
      otterLayer,
  }