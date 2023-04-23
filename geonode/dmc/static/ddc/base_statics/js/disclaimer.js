//doc ready
document.addEventListener("DOMContentLoaded", function () {
  // fix to the base template
  document.querySelectorAll(".tm-bg").forEach((el) => el.remove());
  document.querySelectorAll(".tm-bg-controls-wrapper")[0].remove();
});

// before page load
window.onload = function (e) {
  // fix to the base template
  $.backstretch("destroy", 0);
};


// Not sure if below this three line of code needed
      document.getElementsByTagName('body')[0].setAttribute('data-target','#myScrollspy');
     document.getElementsByTagName('body')[0].setAttribute('data-spy','scroll');
    document.getElementsByTagName('body')[0].setAttribute('data-offset',150);

var offset = 10;
$(document).ready(function(){
    $('a[href^="#"]').click(function(){
        $("html, body").stop().animate({
            scrollTop: $($(this).attr("href")).offset().top  - offset + 'px'
        }, 600);
    });
});