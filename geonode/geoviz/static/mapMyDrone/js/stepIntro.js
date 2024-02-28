// Define the steps for the intro.js
const stepsIntro = [
  
  
  {
    element: "#mapD",
    popover: {
      title: "Map area",
      description:
      `This the right half of the page where the map is displayed.
       It disaply seabee drone mission locations. The number in the circle indicates the number of mission  at that location.`,
   
      align: "center",
    },
  },
  
  
  {
    element: "#sidebar-nav",
    popover: {
      title: "Layer filter pannel",
      description:
      `This is the left half of the page where the layer filter pannel is displayed.`,
       align: "center",
    },
  },


  {
    element: "#panelBtn",
    popover: {
      title: "Collape/Expand the pannel",
      description:
        "click to collape or expand the left pannel.",
   
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
        "Dropdown to define the number of images to display per page.",
   
       
    },
  },


  {
    element: "#droneList_filter",
    popover: {
      title: "Search drone images",
      description:
        "Search for drone images by typing mission name, location, theme, etc. in the search box.",
   
      
    },
  },
  
 
  {
    element: ".dataTables_scroll",
    popover: {
      title: "List of drone images",
      description:
        "List of drone images with mission name, location, theme, etc.",
   
        align: "center",
    },
  },


 
  {
    element: ".odd",
    popover: {
      title: "Info card",
      description:
        "Info card of the mission. Double click on the row to locate the mission on the map.",
   
        align: "center",
    },
  },

  
  {
    element: ".biStyle",
    popover: {
      title: "More info",
      description:
        "Click to get more information about the mission.",
   
        align: "center",
    },
  },


  {
    element: ".navbar",
    popover: {
      title: "Map menu",
      description:
      "Main menu to acess project home page, Data, Maps and Geostory and other important links.",
   
        align: "center",
    },
  },
  {
    element: "#div_user_authantication",
    popover: {
      title: "User authantication",
      description:
        "It works the same in vanilla JavaScript as well as frameworks.",
   
        align: "center",
    },
  },


  {
    element: ".leaflet-control-layers-toggle",
    popover: {
      title: "Switch basemap",
      description:
        "Its list of basemaps. Click to switch the basemap.",
   
        
    },
  },

  {
    element: ".leaflet-draw-section",
    popover: {
      title: "Draw tools",
      description:
        "Draw tools to select the mission by drawing a rectangle or polygon.",
   
        
    },
  },
  {
    element: ".easy-button-button",
    popover: {
      title: "Draw tools",
      description:
        "Its a shortcut to clear all selection and hilighted  items on the map.",
   
        
    },
  },
  {
    element: ".leaflet-control-minimap",
    popover: {
      title: "Location map",
      description:
        "Its overview/location map of the main map.",
   
        
    },
  },

  {
    element: "#chart_countStat",
    popover: {
      title: "Count chart",
      description:
        "Dynamic chart to display the number of mission by theme.",
   
        
    },
  },
  {
    element: "#chart_areaStat",
    popover: {
      title: "Area chart",
      description:
        "Dynamic chart to display the area of mission by theme.",
   
        
    },
  },
  {
    element: ".leaflet-control-attribution",
    popover: {
      title: "Attribution",
      description:
        "Its a acknowledgement of the data sources and list of partners in the project.",
   
    },
  },

];






  // relative to the target element.
  //side?: "top" | "right" | "bottom" | "left";
  //align?: "start" | "center" | "end";