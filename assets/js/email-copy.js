/* Sidebar e-mail: hovering shows the address; clicking copies it instead of opening a mail app.
   A separate "Send email" link keeps the mailto behaviour. Without JavaScript the copy link
   still works as a plain mailto link. */
(function () {
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) { resolve(); } else { reject(new Error("copy failed")); }
    });
  }

  function flash(link, cls) {
    link.classList.remove("is-copied", "is-copy-failed");
    link.classList.add(cls);
    clearTimeout(link._jhTimer);
    link._jhTimer = setTimeout(function () {
      link.classList.remove("is-copied", "is-copy-failed");
    }, cls === "is-copied" ? 1800 : 4000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll(".jh-email-copy");
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        copyText(link.getAttribute("data-email")).then(
          function () { flash(link, "is-copied"); },
          function () { flash(link, "is-copy-failed"); }
        );
      });
    });
  });
})();
