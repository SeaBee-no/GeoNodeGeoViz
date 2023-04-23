
//onload  Organisation you represent and Expertise in plastic pollution

document.addEventListener("DOMContentLoaded", function () {


// add event to "Organisation you represen2
 toogle_organisation_toogle(document.getElementById('id_organisation').value, "id_organisation_other", "Other");
document
  .getElementById("id_organisation")
  .addEventListener("change", function () {
    toogle_organisation_toogle(this.value, "id_organisation_other", "Other");
  });
});





//toogle based on Organisation you represent to Please specify your organisation
toogle_organisation_toogle = (val, id , str) => {
  if (val != str) {

      document.getElementById(id)
      .setAttribute("disabled", 'disabled');
      document.getElementById(id).value ="";

  } else {
 
        document.getElementById(id)
      .removeAttribute("disabled");

  }
};


