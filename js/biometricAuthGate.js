// Biometric Auth Gate — js/biometricAuthGate.js
// Integrates with existing faceUtils/voiceUtils when available and falls back to simple checks for demo purposes.

(function () {
  function el(id) { return document.getElementById(id); }
  document.addEventListener('DOMContentLoaded', () => {
    const gate = el('biometricAuthGate');
    const closeBtn = el('biometricGateClose');
    const authVideo = el('authVideoFeed');
    const faceStatus = el('faceStatusOverlay');
    const recordBtn = el('recordVoiceAuthBtn');
    const playBtn = el('playChallengeBtn');
    const loginBtn = el('executeBiometricLoginBtn');
    const otherBtn = el('otherLoginBtn');
    const voiceText = el('voiceChallengeText');

    let faceVerified = false;
    let voiceVerified = false;
    let localStream = null;
    let currentPhrase = '';

    // Helpers
    function setFaceStatus(text, ok) {
      faceStatus.textContent = text;
      faceStatus.style.color = ok ? '#4FD8C4' : '#F2A65A';
    }
    function updateLoginState() {
      if (faceVerified && voiceVerified) {
        loginBtn.disabled = false;
        loginBtn.style.opacity = '1';
      }
    }

    // Generate a simple random phrase (two words) — matches server behavior in demo repos if used with server.
    function randomPhrase() {
      const words = ['cedar','harbor','lantern','comet','willow','ember','meadow','falcon','birch','quartz'];
      const a = words[Math.floor(Math.random()*words.length)];
      let b = words[Math.floor(Math.random()*words.length)];
      while (b === a) b = words[Math.floor(Math.random()*words.length)];
      return `${a} ${b}`;
    }

    // Close / bypass handlers
    closeBtn.addEventListener('click', () => {
      // allow manual bypass if needed
      hideGate();
    });
    otherBtn.addEventListener('click', () => {
      // reveal the other login UI (the existing login form) and hide gate
      hideGate();
    });

    function hideGate() {
      if (!gate) return;
      gate.style.transition = 'opacity 0.3s ease';
      gate.style.opacity = '0';
      setTimeout(() => {
        gate.style.display = 'none';
        stopStream();
      }, 320);
    }

    function stopStream() {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
        if (authVideo) authVideo.srcObject = null;
      }
    }

    // Face verification: prefer faceUtils.captureDescriptor(video)
    async function attemptFaceVerification() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setFaceStatus('Camera not supported in this browser', false);
        faceVerified = true; // allow fallback
        updateLoginState();
        return;
      }

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        authVideo.srcObject = localStream;
        setFaceStatus('Detecting face — please look at the camera...', false);

        // If user-provided faceUtils exists, use it.
        if (window.faceUtils && typeof faceUtils.captureDescriptor === 'function') {
          try {
            const descriptor = await faceUtils.captureDescriptor(authVideo, { timeoutMs: 3000 });
            if (Array.isArray(descriptor) && descriptor.length >= 32) {
              faceVerified = true;
              setFaceStatus('✔ Face vector captured', true);
              updateLoginState();
              return;
            }
          } catch (e) {
            console.warn('faceUtils capture failed', e);
          }
        }

        // If face-api is present, try a simple detectSingleFace
        if (window.faceapi && typeof faceapi.detectSingleFace === 'function') {
          try {
            // try a few frames (simple loop)
            let found = false;
            for (let i=0;i<6 && !found;i++) {
              // small delay to allow video to warm up
              await new Promise(r => setTimeout(r, 400));
              const detection = await faceapi.detectSingleFace(authVideo).withFaceLandmarks().withFaceDescriptor();
              if (detection && detection.descriptor) found = true;
            }
            if (found) {
              faceVerified = true;
              setFaceStatus('✔ Face detected (face-api)', true);
              updateLoginState();
              return;
            }
          } catch (e) {
            console.warn('face-api detect failed', e);
          }
        }

        // Demo fallback: simple timeout-based confirmation so users can continue testing without full models
        setTimeout(() => {
          if (!faceVerified) {
            faceVerified = true;
            setFaceStatus('✔ Face check (fallback pass)', true);
            updateLoginState();
          }
        }, 2200);

      } catch (err) {
        console.warn('getUserMedia error', err);
        setFaceStatus('⚠ Camera unavailable — continuing with alternative login', false);
        faceVerified = true; // allow fallback
        updateLoginState();
      }
    }

    // Voice verification: prefer voiceUtils.captureVoiceProfile
    function initVoiceChallenge() {
      currentPhrase = randomPhrase();
      voiceText.textContent = `Say: "${currentPhrase}"`;

      // play back phrase (speechSynthesis) for accessibility
      playBtn.addEventListener('click', () => {
        try {
          const u = new SpeechSynthesisUtterance(currentPhrase);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch (e) { console.warn(e); }
      });

      // record / capture
      recordBtn.addEventListener('mousedown', async () => {
        recordBtn.textContent = 'Recording… release to stop';
        recordBtn.disabled = true; // simple UX to prevent reentry
        try {
          if (window.voiceUtils && typeof voiceUtils.captureVoiceProfile === 'function') {
            const res = await voiceUtils.captureVoiceProfile({ durationMs: 3000, phrase: currentPhrase });
            if (res && res.transcript) {
              // simple normalization
              const got = (res.transcript || '').toLowerCase().trim();
              if (got.includes(currentPhrase.split(' ')[0]) || got.includes(currentPhrase.split(' ')[1])) {
                voiceVerified = true;
                recordBtn.textContent = '✔ Voice verified';
                recordBtn.style.background = 'rgba(79,216,196,0.08)';
                updateLoginState();
                return;
              }
            }
          }

          // Fallback: simulate a short capture and mark as verified for demo
          await new Promise(r => setTimeout(r, 1200));
          voiceVerified = true;
          recordBtn.textContent = '✔ Voice (fallback)';
          recordBtn.style.background = 'rgba(79,216,196,0.08)';
          updateLoginState();

        } catch (e) {
          console.warn('voice capture failed', e);
          recordBtn.textContent = 'Recording failed';
        } finally {
          setTimeout(() => { recordBtn.disabled = false; recordBtn.textContent = '🎙️ Record'; }, 800);
        }
      });

      // touch support for mobile
      recordBtn.addEventListener('touchstart', (ev) => { ev.preventDefault(); recordBtn.dispatchEvent(new Event('mousedown')); });
    }

    // Authentication button
    loginBtn.addEventListener('click', () => {
      // Here you would normally call your server /api/login flow with captured descriptors/profiles
      hideGate();
    });

    // HTTPS check notice (public deployments require HTTPS for camera/mic)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      // show a note in the faceStatus overlay
      faceStatus.textContent = 'Note: camera/mic require HTTPS on public domains — use localhost for testing.';
      faceStatus.style.color = '#F2A65A';
    }

    // Start the gate logic
    attemptFaceVerification();
    initVoiceChallenge();

    // Make Esc hide gate for convenience (but keep it accessible)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideGate();
    });

    // Clean up when navigating away
    window.addEventListener('beforeunload', stopStream);
  });
})();
