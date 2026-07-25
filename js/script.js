// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  // Contact form: no backend yet, so we build a mailto: link from the fields.
  // Swap this out for a real form service (e.g. Formspree) when you're ready —
  // see the note in contact.html.
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      var subject = encodeURIComponent("New message from " + name + " via WhatsWrongWithMe?");
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:hello@yourdomain.com?subject=" + subject + "&body=" + body;
    });
  }
});
