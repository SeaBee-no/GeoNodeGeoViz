// Define the steps for the intro.js
const stepsIntro = [
  
  
  {
    element: "#mapD",
    popover: {
      title: "Map area",
      description:
      `The right half of the page displays the map. It displays the SeaBee drone mission locations. The numbers in the colored circles indicate the number of missions at that location`,
   
      align: "center",
    },
  },
  
  
  {
    element: "#sidebar-nav",
    popover: {
      title: "Layer filter pannel",
      description:
      `The left half of the page displays the layer filter panel.`,
       align: "center",
    },
  },


  {
    element: "#panelBtn",
    popover: {
      title: "Collape/Expand the pannel",
      description:
        "Click to collapse or expand the left panel.",
   
        align: "center",
    },
  },


  {
    element: "#div_divTheme",
    popover: {
      title: "Theme filter",
      description:
        "Filter the drone mission by theme.",
   
      
    },
  },  

 {
    element: "#droneList_length",
    popover: {
      title: "Images to display",
      description:
        "Dropdown to define the number of images to be displayed per page.",
   
       
    },
  },


  {
    element: "#droneList_filter",
    popover: {
      title: "Search drone images",
      description:
        "Search box to select drone images by mission name, location, theme, etc.",
   
      
    },
  },
  
 
  {
    element: ".dataTables_scroll",
    popover: {
      title: "List of drone images",
      description:
        "List of selected drone images, including mission name, location, theme, etc.",
   
        align: "center",
    },
  },


 
  {
    element: ".odd",
    popover: {
      title: "Info card",
      description:
        "Double click on the row to locate the image on the map.",
   
        align: "center",
    },
  },

  
  {
    element: ".biStyle",
    popover: {
      title: "More info",
      description:
        "Click to get more information about the mission/image.",
   
        align: "center",
    },
  },


  {
    element: ".navbar",
    popover: {
      title: "Map menu",
      description:
      "Main menu to access the SeaBee home page, Data, Maps, Geostories, and other important links.",
   
        align: "center",
    },
  },
  {
    element: "#div_user_authantication",
    popover: {
      title: "User authantication",
      description:
        "User authanication to access the SeaBee date.",
   
        align: "center",
    },
  },


  {
    element: ".leaflet-control-layers-toggle",
    popover: {
      title: "Switch basemap",
      description:
        "Click to switch between different basemaps",
   
        
    },
  },

  {
    element: ".leaflet-draw-section",
    popover: {
      title: "Draw tools",
      description:
        "Tool to select missions by drawing a rectangle or polygon.",
   
        
    },
  },
  {
    element: ".easy-button-button",
    popover: {
      title: "Clear selections",
      description:
        "Shortcut to clear selections and highlighted items on the map.",
   
        
    },
  },
  {
    element: ".leaflet-control-minimap",
    popover: {
      title: "Location map",
      description:
        "Overview map of your displayed map section.",
   
        
    },
  },

  {
    element: "#chart_countStat",
    popover: {
      title: "Count chart",
      description:
        "Dynamic chart displaying the number of missions by theme in your display.",
   
        
    },
  },
  {
    element: "#chart_areaStat",
    popover: {
      title: "Area chart",
      description:
        "Dynamic chart displaying the total area of missions by theme in your display.",
   
        
    },
  },
  {
    element: ".leaflet-control-attribution",
    popover: {
      title: "Attribution",
      description:
        "Acknowledgement of the data sources and list of SeaBee partners.",
   
    },
  },

];






  // relative to the target element.
  //side?: "top" | "right" | "bottom" | "left";
  //align?: "start" | "center" | "end";