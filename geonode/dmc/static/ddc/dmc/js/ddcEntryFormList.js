//doc ready
document.addEventListener("DOMContentLoaded", function () {

  // fix to the base template
  document.querySelectorAll(".tm-bg").forEach((el) => el.remove());
  document.querySelectorAll(".tm-bg-controls-wrapper")[0].remove();


});

//});

// before page load
window.onload = function (e) {
  // fix to the base template
  $.backstretch("destroy", 0);
};


