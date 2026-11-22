/* SAR / optical compare slider on the homepage intro */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var stage = document.getElementById("compare");
    if (!stage) return;
    var range = stage.querySelector(".compare__range");
    var update = function () { stage.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", update);
    update();
  });
})();
