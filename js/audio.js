/* ============================================
   GameStar Survivors - Audio System
   Web Audio API - Procedural Sound Effects
   ============================================ */

let audioCtx = null;

function initAudio() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio not supported');
        CONFIG.SOUND_ENABLED = false;
    }
}

function playSound(type) {
    if (!CONFIG.SOUND_ENABLED || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    switch (type) {
        case 'hit': playHitSound(now); break;
        case 'explosion': playExplosionSound(now); break;
        case 'xp': playXPSound(now); break;
        case 'levelup': playLevelUpSound(now); break;
        case 'damage': playDamageSound(now); break;
        case 'death': playDeathSound(now); break;
        case 'shoot': playShootSound(now); break;
        case 'achievement': playAchievementSound(now); break;
    }
}

function playHitSound(now) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(200 + Math.random() * 100, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
}

function playExplosionSound(now) {
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
}

function playXPSound(now) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

    gain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
}

function playLevelUpSound(now) {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(CONFIG.MASTER_VOLUME * 0.3, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
    });
}

function playDamageSound(now) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
}

function playDeathSound(now) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

    gain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.start(now);
    osc.stop(now + 0.8);
}

function playShootSound(now) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
}

function playAchievementSound(now) {
    const notes = [392, 523, 659, 784, 1047]; // G4, C5, E5, G5, C6
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(CONFIG.MASTER_VOLUME * 0.4, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
    });
}

// Background Music (simple procedural loop)
let musicPlaying = false;
let musicOsc = null;
let musicGain = null;

function startBackgroundMusic() {
    if (!CONFIG.SOUND_ENABLED || !audioCtx || musicPlaying) return;

    musicGain = audioCtx.createGain();
    musicGain.gain.setValueAtTime(CONFIG.MASTER_VOLUME * 0.1, audioCtx.currentTime);
    musicGain.connect(audioCtx.destination);

    // Simple bass drone
    musicOsc = audioCtx.createOscillator();
    musicOsc.type = 'sine';
    musicOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // A1
    musicOsc.connect(musicGain);
    musicOsc.start();

    musicPlaying = true;
}

function stopBackgroundMusic() {
    if (musicOsc) {
        musicOsc.stop();
        musicOsc = null;
    }
    musicPlaying = false;
}
