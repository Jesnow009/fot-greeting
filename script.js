/**
 * Romantic Greeting Web App
 * Features:
 * - Mobile-first touch interactions
 * - Web Audio API procedural sound synthesizer (Zero external dependencies)
 * - Canvas floating hearts & rose petal particles
 * - 3D envelope unsealing animation
 * - Real-time love counter (Days, Hours, Minutes, Seconds)
 * - 3D interactive flip cards for "Reasons Why I Love You"
 * - Redeemable romantic love coupons
 * - Flying heart clicker counter
 * - Playful runaway "No" button & confetti celebration
 * - Magic shareable URL generator (encodes customization into link)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DEFAULT DATA CONFIGURATION
  // =========================================================================
  const DEFAULT_CONFIG = {
    herName: "KURUTT",
    hisName: "Vava",
    startDate: "2022-11-05T00:00:00",
    letter: `Happy Anniversary, my love! When our story began on November 5th, 2022, I never could have imagined just how much joy, peace, and warmth you would bring into my world.

You are the sweetest part of my days, the smile I always look forward to, and my comfort when life gets overwhelming. Your laugh is my favorite melody, and your kindness is the most beautiful thing I've ever known.

Thank you for choosing me, for holding my hand, and for being my best friend through every moment. Here's to us, our love, and a lifetime of forever together.`,
    whyLoveParagraph: `Every little thing about you makes my world so much brighter. The way your eyes light up when you smile, your gentle heart that always cares for me, and the comforting peace I feel whenever you are near. You are not just my love, Kurutt; you are my home, my favorite thought every morning, and the greatest blessing of my life.`,
    reasons: [
      { icon: "✨", title: "Kurutt's Smile", desc: "The way your entire face lights up and immediately brightens my world." },
      { icon: "🫂", title: "Your Warmth", desc: "How safe, peaceful, and happy I feel every second you hold my hand." },
      { icon: "😂", title: "Our Goofiness", desc: "All the silly inside jokes and hilarious laughs only Kurutt & Vava get." },
      { icon: "🌸", title: "Your Sweet Heart", desc: "The gentle, loving soul you share that makes you so incredibly special." },
      { icon: "💖", title: "You Believe in Me", desc: "How you stand by me, encourage me, and make me want to be the best for you." },
      { icon: "🌙", title: "Every Ordinary Day", desc: "How even just sitting quietly doing nothing feels magical with you, Kurutt." }
    ],
    coupons: [
      { icon: "🍦", title: "Midnight Snack Run", sub: "Vava will fetch whatever food or ice cream Kurutt is craving!" },
      { icon: "👑", title: "Queen Kurutt VIP Day", sub: "A whole day of royal pampering, zero chores, and whatever Kurutt wants!" },
      { icon: "🎬", title: "Movie Night Dictator", sub: "Kurutt picks the movie, the snacks, and Vava doesn't complain once!" },
      { icon: "❤️", title: "Free Pass: Win Any Argument", sub: "Show this coupon and Vava immediately admits Kurutt is 100% right!" },
      { icon: "🤗", title: "Unlimited Cuddles", sub: "Valid anytime for endless hugs, comfort, and forehead kisses from Vava." }
    ]
  };

  let appConfig = Object.assign({}, DEFAULT_CONFIG);

  // =========================================================================
  // 2. PARSE CONFIG (URL HASH OR LOCALSTORAGE)
  // =========================================================================
  function loadConfiguration() {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#cfg=')) {
        const encoded = hash.substring(5);
        const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
        const parsed = JSON.parse(jsonStr);
        if (parsed.letter) parsed.letter = parsed.letter.replace(/2023/g, '2022');
        if (parsed.startDate && parsed.startDate.startsWith('2023')) parsed.startDate = parsed.startDate.replace('2023', '2022');
        appConfig = Object.assign({}, DEFAULT_CONFIG, parsed);
        return;
      }
    } catch (e) {
      console.warn("Could not parse config from URL hash:", e);
    }

    try {
      const saved = localStorage.getItem('romantic_site_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.letter) parsed.letter = parsed.letter.replace(/2023/g, '2022');
        if (parsed.startDate && parsed.startDate.startsWith('2023')) parsed.startDate = parsed.startDate.replace('2023', '2022');
        // Ensure Kurutt & Vava with 2022 are used
        if (!parsed.herName || parsed.herName === "My Princess" || parsed.herName === "Novia" || parsed.startDate === "2024-01-01T00:00:00" || parsed.startDate === "2023-11-05T00:00:00") {
          appConfig = Object.assign({}, DEFAULT_CONFIG);
          localStorage.setItem('romantic_site_config', JSON.stringify(appConfig));
        } else {
          appConfig = Object.assign({}, DEFAULT_CONFIG, parsed);
        }
      }
    } catch (e) {
      console.warn("Could not parse config from localStorage:", e);
    }
  }

  loadConfiguration();
  if (appConfig.letter) appConfig.letter = appConfig.letter.replace(/2023/g, '2022');
  if (appConfig.startDate && appConfig.startDate.includes('2023')) appConfig.startDate = appConfig.startDate.replace('2023', '2022');

  // =========================================================================
  // 3. SOUND SYNTHESIZER (WEB AUDIO API - ZERO ASSETS NEEDED)
  // =========================================================================
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicInterval = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft sparkle harp chime for envelope & cards
  function playSparkleSound() {
    if (!audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.8);
        } catch (e) {}
      }, idx * 75);
    });
  }

  // Gentle pop / bubble sound for hearts
  function playHeartPopSound() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freq = 400 + Math.random() * 300;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  // Triumphant romantic celebration fanfare
  function playCelebrationFanfare() {
    if (!audioCtx) return;
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.2 },
      { f: 1046.50, d: 0.4 },
      { f: 880.00, d: 0.2 },
      { f: 1046.50, d: 0.7 }
    ];
    let time = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.f, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + note.d);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + note.d);
        } catch (e) {}
      }, time * 1000);
      time += note.d + 0.05;
    });
  }

  // Background MP3 Music Player
  const bgMusicAudio = document.getElementById('bgMusic');

  function startBackgroundMusic() {
    if (!bgMusicAudio) return;
    bgMusicAudio.volume = 0.7;
    const playPromise = bgMusicAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isMusicPlaying = true;
        updateMusicUI();
      }).catch((err) => {
        console.log("Audio waiting for user gesture or mp3 file:", err);
        isMusicPlaying = false;
        updateMusicUI();
      });
    }
  }

  function stopBackgroundMusic() {
    if (bgMusicAudio) {
      bgMusicAudio.pause();
    }
    isMusicPlaying = false;
    updateMusicUI();
  }

  function toggleMusic() {
    initAudio();
    if (isMusicPlaying) {
      stopBackgroundMusic();
    } else {
      startBackgroundMusic();
    }
  }

  function updateMusicUI() {
    const pill = document.getElementById('musicToggleBtn');
    const label = document.getElementById('musicLabel');
    if (!pill || !label) return;
    if (isMusicPlaying) {
      pill.classList.add('playing');
      label.textContent = "Music On";
    } else {
      pill.classList.remove('playing');
      label.textContent = "Play Music";
    }
  }

  // =========================================================================
  // 4. FLOATING CANVAS PARTICLES (HEARTS, PETALS, SPARKLES)
  // =========================================================================
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = 8 + Math.random() * 16;
      this.speedY = 0.5 + Math.random() * 1.2;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 2;
      this.opacity = 0.3 + Math.random() * 0.5;
      this.type = Math.random() > 0.4 ? 'heart' : 'petal';
      this.color = Math.random() > 0.5 ? '#ff758f' : '#ffb3c1';
    }
    update() {
      this.y -= this.speedY;
      this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y < -30 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'heart') {
        ctx.fillStyle = this.color;
        const s = this.size / 15;
        ctx.scale(s, s);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-5, -5, -10, 0, 0, 10);
        ctx.bezierCurveTo(10, 0, 5, -5, 0, 0);
        ctx.fill();
      } else {
        // Petal shape
        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.25, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 35; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // =========================================================================
  // 5. ENVELOPE OPENING INTERACTION
  // =========================================================================
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const envelopeScreen = document.getElementById('envelopeScreen');
  const mainContent = document.getElementById('mainContent');
  let hasOpened = false;

  function openEnvelope() {
    if (hasOpened) return;
    hasOpened = true;
    initAudio();
    playSparkleSound();

    envelopeWrapper.classList.add('open');

    // Burst of magical hearts from unwrapping the gift
    try {
      const rect = envelopeWrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 24; i++) {
        setTimeout(() => {
          spawnTapHeart(cx + (Math.random() - 0.5) * 90, cy + (Math.random() - 0.5) * 60);
        }, i * 30);
      }
    } catch (e) {}

    // Auto-start ambient melody on gift open
    setTimeout(() => {
      startBackgroundMusic();
    }, 400);

    setTimeout(() => {
      envelopeScreen.classList.add('fade-out');
      setTimeout(() => {
        envelopeScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    }, 1200);
  }

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', openEnvelope);
    envelopeWrapper.addEventListener('touchend', (e) => {
      e.preventDefault();
      openEnvelope();
    });
  }

  // =========================================================================
  // 6. POPULATE UI CONTENT FROM CONFIG
  // =========================================================================
  function renderAllContent() {
    // Envelope preview
    const previewName = document.querySelector('.her-name-preview');
    if (previewName) previewName.textContent = appConfig.herName;

    // Hero title
    const displayHerName = document.getElementById('displayHerName');
    if (displayHerName) displayHerName.textContent = appConfig.herName;

    // Letter
    const letterHerName = document.getElementById('letterHerName');
    if (letterHerName) letterHerName.textContent = appConfig.herName;

    const letterHisName = document.getElementById('letterHisName');
    if (letterHisName) letterHisName.textContent = appConfig.hisName + " ❤️";

    const letterBody = document.getElementById('letterBodyText');
    if (letterBody) letterBody.textContent = appConfig.letter;

    // Render Why I Love You Paragraph
    renderWhyLoveParagraph();

    // Render Reasons
    renderReasonsGrid();

    // Render Coupons
    renderCouponsList();
  }

  // =========================================================================
  // 7. LIVE LOVE COUNTER
  // =========================================================================
  function updateTimer() {
    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMinutes');
    const secsEl = document.getElementById('countSeconds');

    if (!daysEl) return;

    const start = new Date(appConfig.startDate).getTime();
    const now = new Date().getTime();
    let diff = Math.max(0, now - start);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minsEl.textContent = minutes.toString().padStart(2, '0');
    secsEl.textContent = seconds.toString().padStart(2, '0');
  }

  setInterval(updateTimer, 1000);
  updateTimer();

  // =========================================================================
  // 7.5. WHY I LOVE YOU PARAGRAPH
  // =========================================================================
  function renderWhyLoveParagraph() {
    const el = document.getElementById('whyLoveParagraphText');
    if (el && appConfig.whyLoveParagraph) {
      el.textContent = appConfig.whyLoveParagraph;
    }
  }

  // =========================================================================
  // 8. "REASONS WHY I LOVE YOU" FLIP CARDS
  // =========================================================================
  function renderReasonsGrid() {
    const grid = document.getElementById('reasonsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    appConfig.reasons.forEach((reason, index) => {
      const card = document.createElement('div');
      card.className = 'flip-card';
      card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <span class="card-number-tag">Reason #${index + 1}</span>
            <div class="card-front-icon">${reason.icon}</div>
            <div class="card-front-tap">${reason.title} 👆</div>
          </div>
          <div class="flip-card-back">
            <p class="card-back-text">${reason.desc}</p>
            <span class="card-back-sparkle">💖</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        initAudio();
        card.classList.toggle('flipped');
        playSparkleSound();
        updateReasonsProgress();
      });

      grid.appendChild(card);
    });

    updateReasonsProgress();
  }

  function updateReasonsProgress() {
    const allCards = document.querySelectorAll('.flip-card');
    const flippedCards = document.querySelectorAll('.flip-card.flipped');
    const progressEl = document.getElementById('reasonsProgress');
    if (!progressEl || allCards.length === 0) return;

    if (flippedCards.length === allCards.length) {
      progressEl.innerHTML = `🎉 You've unlocked all ${allCards.length} reasons! (And there are a million more!) 💕`;
    } else {
      progressEl.innerHTML = `✨ Discovered ${flippedCards.length} of ${allCards.length} reasons (tap to flip!)`;
    }
  }

  // =========================================================================
  // 9. LOVE COUPONS
  // =========================================================================
  function renderCouponsList() {
    const list = document.getElementById('couponsList');
    if (!list) return;
    list.innerHTML = '';

    appConfig.coupons.forEach((coupon, idx) => {
      const item = document.createElement('div');
      item.className = 'coupon-item';
      item.innerHTML = `
        <div class="coupon-left">
          <div class="coupon-icon">${coupon.icon}</div>
          <div>
            <div class="coupon-title">${coupon.title}</div>
            <div class="coupon-sub">${coupon.sub}</div>
          </div>
        </div>
        <button class="btn-redeem" data-idx="${idx}">Redeem</button>
      `;

      const btn = item.querySelector('.btn-redeem');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        initAudio();
        playSparkleSound();
        item.classList.add('redeemed');
        btn.textContent = 'Claimed! 🥰';

        // Add stamp badge
        const stamp = document.createElement('div');
        stamp.className = 'coupon-stamp';
        stamp.textContent = 'REDEEMED!';
        item.appendChild(stamp);
      });

      list.appendChild(item);
    });
  }

  // =========================================================================
  // 10. FLYING HEART SHOWER CLICKER
  // =========================================================================
  let heartsCount = 0;
  const hugeHeartBtn = document.getElementById('hugeHeartBtn');
  const loveCounterEl = document.getElementById('loveCounter');
  const clickerEncouragement = document.getElementById('clickerEncouragement');

  const encouragementList = [
    "Vava's heart skipped a beat for Kurutt! 💓",
    "Kurutt sent infinite love! Vava is the happiest guy! 🥰",
    "Vava loves Kurutt to the moon and back! 🌙💖",
    "10,000 kisses sent straight to Kurutt! 💋",
    "Kurutt + Vava = Forever & Always! 💍✨",
    "Vava is the luckiest guy alive to have Kurutt! 🍀💖",
    "Happy Anniversary Kurutt, you are my whole world! 🌸"
  ];

  function spawnTapHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'flying-tap-heart';
    const emojis = ['💖', '💕', '💘', '🌸', '✨', '🥰', '❤️'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const tx = (Math.random() - 0.5) * 120 + 'px';
    const rot = (Math.random() - 0.5) * 60 + 'deg';
    heart.style.setProperty('--tx', tx);
    heart.style.setProperty('--rot', rot);
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }

  function handleHeartClick(e) {
    initAudio();
    playHeartPopSound();
    heartsCount++;
    if (loveCounterEl) loveCounterEl.textContent = heartsCount;

    // Get tap coordinate
    const rect = hugeHeartBtn.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    spawnTapHeart(x, y);

    if (clickerEncouragement) {
      const quote = encouragementList[heartsCount % encouragementList.length];
      clickerEncouragement.textContent = quote;
    }
  }

  if (hugeHeartBtn) {
    hugeHeartBtn.addEventListener('click', handleHeartClick);
    hugeHeartBtn.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      handleHeartClick({ clientX: touch.clientX, clientY: touch.clientY });
    });
  }

  // =========================================================================
  // 11. PLAYFUL RUNAWAY "NO" BUTTON & CELEBRATION
  // =========================================================================
  const btnNo = document.getElementById('btnNo');
  const btnYes = document.getElementById('btnYes');
  const noTeaseMsg = document.getElementById('noTeaseMessage');
  const questionCard = document.getElementById('questionCard');
  const celebrationOverlay = document.getElementById('celebrationOverlay');
  const btnCloseCeleb = document.getElementById('btnCloseCeleb');

  const teaseMessages = [
    "Kurutt, you can't escape Vava's love! 😜",
    "Nice try, Kurutt! Vava's love is inescapable! 🏃‍♂️💨",
    "The 'No' button is broken for Kurutt, only 'YES' works! 💕",
    "Kurutt is stuck with Vava forever and ever! 🥰",
    "Try again Kurutt! You know you want to say Yes! 💖",
    "Vava loves Kurutt way too much to accept a No! 😘"
  ];
  let teaseIndex = 0;

  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    initAudio();
    playHeartPopSound();

    const cardRect = questionCard.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Determine random boundary positions inside card
    const maxX = cardRect.width - btnRect.width - 30;
    const maxY = cardRect.height - btnRect.height - 30;

    const randomX = Math.max(10, Math.floor(Math.random() * maxX));
    const randomY = Math.max(70, Math.floor(Math.random() * maxY));
    const randomRot = (Math.random() - 0.5) * 24;

    btnNo.style.position = 'absolute';
    btnNo.style.left = randomX + 'px';
    btnNo.style.top = randomY + 'px';
    btnNo.style.transform = `rotate(${randomRot}deg) scale(0.9)`;

    if (noTeaseMsg) {
      noTeaseMsg.textContent = teaseMessages[teaseIndex % teaseMessages.length];
      teaseIndex++;
    }
  }

  if (btnNo) {
    btnNo.addEventListener('mouseenter', dodgeNoButton);
    btnNo.addEventListener('touchstart', dodgeNoButton);
    btnNo.addEventListener('click', dodgeNoButton);
  }

  // Trigger celebration on YES
  if (btnYes) {
    btnYes.addEventListener('click', () => {
      initAudio();
      playCelebrationFanfare();
      celebrationOverlay.classList.remove('hidden');

      // Burst of confetti hearts
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          const rx = Math.random() * window.innerWidth;
          const ry = Math.random() * (window.innerHeight * 0.7);
          spawnTapHeart(rx, ry);
        }, i * 40);
      }
    });
  }

  if (btnCloseCeleb) {
    btnCloseCeleb.addEventListener('click', () => {
      celebrationOverlay.classList.add('hidden');
    });
  }

  // =========================================================================
  // 12. CUSTOMIZER MODAL & SHAREABLE LINK GENERATOR
  // =========================================================================
  const openCustomizerBtn = document.getElementById('openCustomizerBtn');
  const customizerModal = document.getElementById('customizerModal');
  const btnCloseCustomizer = document.getElementById('btnCloseCustomizer');
  const inputHerName = document.getElementById('inputHerName');
  const inputHisName = document.getElementById('inputHisName');
  const inputDate = document.getElementById('inputDate');
  const inputLetter = document.getElementById('inputLetter');
  const inputWhyLove = document.getElementById('inputWhyLove');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const btnShareLink = document.getElementById('btnShareLink');
  const btnResetDefaults = document.getElementById('btnResetDefaults');
  const shareFeedback = document.getElementById('shareFeedback');

  function openCustomizer() {
    inputHerName.value = appConfig.herName || "";
    inputHisName.value = appConfig.hisName || "";
    if (appConfig.startDate) {
      inputDate.value = appConfig.startDate.substring(0, 16);
    }
    inputLetter.value = appConfig.letter || "";
    if (inputWhyLove) inputWhyLove.value = appConfig.whyLoveParagraph || "";
    shareFeedback.classList.add('hidden');
    customizerModal.classList.remove('hidden');
  }

  function closeCustomizer() {
    customizerModal.classList.add('hidden');
  }

  function saveCurrentConfig() {
    if (inputHerName.value.trim()) appConfig.herName = inputHerName.value.trim();
    if (inputHisName.value.trim()) appConfig.hisName = inputHisName.value.trim();
    if (inputDate.value) appConfig.startDate = inputDate.value;
    if (inputLetter.value.trim()) appConfig.letter = inputLetter.value.trim();
    if (inputWhyLove && inputWhyLove.value.trim()) appConfig.whyLoveParagraph = inputWhyLove.value.trim();

    try {
      localStorage.setItem('romantic_site_config', JSON.stringify(appConfig));
    } catch (e) {}

    renderAllContent();
    updateTimer();
  }

  function generateShareLink() {
    saveCurrentConfig();

    let sharePayload = JSON.parse(JSON.stringify(appConfig));
    const jsonStr = JSON.stringify(sharePayload);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
    const url = window.location.origin + window.location.pathname + '#cfg=' + encoded;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showFeedback("✅ Magic Link Copied! Send it on WhatsApp/iMessage to her phone! 💌");
      }).catch(() => {
        prompt("Copy this magic link to send to her phone:", url);
      });
    } else {
      prompt("Copy this magic link to send to her phone:", url);
    }
  }

  function showFeedback(text) {
    shareFeedback.textContent = text;
    shareFeedback.classList.remove('hidden');
  }

  if (openCustomizerBtn) openCustomizerBtn.addEventListener('click', openCustomizer);
  if (btnCloseCustomizer) btnCloseCustomizer.addEventListener('click', closeCustomizer);

  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      saveCurrentConfig();
      showFeedback("💾 Saved successfully! Details updated on screen.");
    });
  }

  if (btnShareLink) {
    btnShareLink.addEventListener('click', generateShareLink);
  }

  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm("Reset to default romantic template?")) {
        appConfig = Object.assign({}, DEFAULT_CONFIG);
        try {
          localStorage.removeItem('romantic_site_config');
          window.location.hash = '';
        } catch (e) {}
        renderAllContent();
        openCustomizer();
        showFeedback("🔄 Reset to lovely defaults!");
      }
    });
  }

  // Audio pill toggle
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  // Initialize display
  renderAllContent();

})();
