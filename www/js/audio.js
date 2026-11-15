/* ===== Imports ===== */
import { saveState, state } from './state.js';
export function playXPBlip() {
    if (!state.settings.sound) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) { /* silent fail */ }
}

export function playLevelUpTone() {
    if (!state.settings.sound) return;
try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioCtx.createOscillator();
const oscillator2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator1.type = 'square';
        oscillator2.type = 'triangle';
        oscillator1.frequency.setValueAtTime(523, audioCtx.currentTime);
oscillator2.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1); 
        
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator1.start();
        oscillator2.start();
        oscillator1.stop(audioCtx.currentTime + 0.3);
        oscillator2.stop(audioCtx.currentTime + 0.3);
} catch (e) { /* silent fail */ }
}

export function playAchievementTone() {
    if (!state.settings.sound) return;
try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sawtooth'; 
        oscillator.frequency.setValueAtTime(698, audioCtx.currentTime);
// F5
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
// Quick high/low ping sound
        oscillator.frequency.linearRampToValueAtTime(830, audioCtx.currentTime + 0.1);
// G#5
        gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
} catch (e) { /* silent fail */ }
}

// NOVA FUNÇÃO DE SOM (PONTO 3), baseada no estilo da v3.7.3
export function playProficiencySound() {
    if (!state.settings.sound) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'triangle'; 
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05); // Subida rápida
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) { /* silent fail */ }
}

export function launchConfetti(duration, count) {
    const container = document.getElementById('confetti-container');
container.innerHTML = ''; 
    const colors = ['#ffd66b', '#ffb84d', '#5fb0ff', '#b58bff', '#18d39b'];
for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Lógica da v3.7.3 (Espalhado pelo topo)
        const xStart = Math.random() * 100 + 'vw';
const yStart = -20 - Math.random() * 30 + 'px';
        const xEnd = Math.random() * 100 + 'vw';
        
        confetti.style.setProperty('--x-start', xStart);
confetti.style.setProperty('--y-start', yStart);
        confetti.style.setProperty('--x-end', xEnd);
        confetti.style.animationDelay = (Math.random() * 1.5) + 's';
        confetti.style.left = xStart;

        container.appendChild(confetti);
}
    
    setTimeout(() => {
        container.innerHTML = '';
    }, duration);
}

export function toggleSound() {
    // Checkbox is CHECKED when sound is DISABLED
    state.settings.sound = !document.getElementById('setting-sound').checked;
saveState();
}
