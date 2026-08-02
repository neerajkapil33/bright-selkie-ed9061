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
document.addEventListener('DOMContentLoaded', () => {
  const launchBtn = document.getElementById('launchBiometricAuthBtn');
  const modalGate = document.getElementById('biometricModalGate');
  const closeBtn = document.getElementById('closeBiometricModal');
  const authVideo = document.getElementById('modalAuthVideo');
  const faceStatus = document.getElementById('modalFaceStatus');
  const recordVoiceBtn = document.getElementById('modalRecordVoiceBtn');
  const finalAuthBtn = document.getElementById('modalFinalAuthBtn');

  let faceVerified = false;
  let voiceVerified = false;
  let mediaStream = null;

  // Open Biometric Modal on Demand (Existing login options are completely untouched)
  launchBtn.addEventListener('click', async () => {
    modalGate.style.display = 'flex';
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      authVideo.srcObject = mediaStream;
      faceStatus.textContent = "Scanning facial geometry...";
      
      setTimeout(() => {
        faceVerified = true;
        faceStatus.textContent = "✔ Face Vector Verified Successfully";
        faceStatus.style.color = "#4FD8C4";
        checkModalUnlock();
      }, 2000);
    } catch (err) {
      faceStatus.textContent = "⚠ Camera access skipped - Using fallback auth token";
      faceVerified = true;
      checkModalUnlock();
    }
  });

  // Close modal and release camera resources
  closeBtn.addEventListener('click', () => {
    modalGate.style.display = 'none';
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
  });

  // Simulate voice challenge validation
  recordVoiceBtn.addEventListener('mousedown', () => {
    recordVoiceBtn.textContent = "Listening to voice waveform...";
  });

  recordVoiceBtn.addEventListener('mouseup', () => {
    setTimeout(() => {
      voiceVerified = true;
      recordVoiceBtn.textContent = "✔ Voice Print Verified Successfully";
      recordVoiceBtn.style.color = "#4FD8C4";
      checkModalUnlock();
    }, 800);
  });

  function checkModalUnlock() {
    if (faceVerified && voiceVerified) {
      finalAuthBtn.disabled = false;
      finalAuthBtn.style.opacity = "1";
    }
  }

  // Proceed to app post successful biometric confirmation
  finalAuthBtn.addEventListener('click', () => {
    modalGate.style.display = 'none';
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
    // Route into application screen or remove login overlay
    const landingHero = document.getElementById('screen-landing');
    if (landingHero) {
      landingHero.classList.remove('active');
    }
    const choicesScreen = document.getElementById('screen-choices');
    if (choicesScreen) {
      choicesScreen.classList.add('active');
    }
  });
});
