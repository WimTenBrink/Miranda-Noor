
export const playBeep = () => {
    // Check if window is defined and AudioContext is supported
    if (typeof window === 'undefined' || (!window.AudioContext && !(window as any).webkitAudioContext)) {
        console.warn("Web Audio API is not supported in this browser.");
        return;
    }

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect the nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure the sound based on the user's provided code
        oscillator.type = 'sine';
        oscillator.frequency.value = 440; // Frequency in hertz (A4)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.05); // Fade in
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5); // Fade out

        // Start and stop the sound
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.error("Error playing beep sound with Web Audio API:", e);
    }
};
