import getConnection from './get-connection.js';
import Transport from './transport.js';

const synthesizerOutput = await getConnection('synthesizer', 'outputs');

const SELECTORS = {
    playButton: '#play-button',
    pauseButton: '#pause-button',
    resumeButton: '#resume-button',
    stopButton: '#stop-button'
};

const transport = new Transport(
    document.querySelector(SELECTORS.playButton),
    document.querySelector(SELECTORS.pauseButton),
    document.querySelector(SELECTORS.resumeButton),
    document.querySelector(SELECTORS.stopButton),
    synthesizerOutput
);

transport.setTempo(300);

const twinkleTwinkleLittleStarNotes = [
    { start: 0, length: 0.9, note: 60},
    { start: 1, length: 0.9, note: 60},
    { start: 2, length: 0.9, note: 67},
    { start: 3, length: 0.9, note: 67},
    { start: 4, length: 0.9, note: 69},
    { start: 5, length: 0.9, note: 69},
    { start: 6, length: 1.9, note: 67},
    { start: 8, length: 0.9, note: 65},
    { start: 9, length: 0.9, note: 65},
    { start: 10, length: 0.9, note: 64},
    { start: 11, length: 0.9, note: 64},
    { start: 12, length: 0.9, note: 62},
    { start: 13, length: 0.9, note: 62},
    { start: 14, length: 1.9, note: 60},
    { start: 16, length: 0.9, note: 67},
    { start: 17, length: 0.9, note: 67},
    { start: 18, length: 0.9, note: 65},
    { start: 19, length: 0.9, note: 65},
    { start: 20, length: 0.9, note: 64},
    { start: 21, length: 0.9, note: 64},
    { start: 22, length: 1.9, note: 62},
    { start: 24, length: 0.9, note: 67},
    { start: 25, length: 0.9, note: 67},
    { start: 26, length: 0.9, note: 65},
    { start: 27, length: 0.9, note: 65},
    { start: 28, length: 0.9, note: 64},
    { start: 29, length: 0.9, note: 64},
    { start: 30, length: 1.9, note: 62},
    { start: 32, length: 0.9, note: 60},
    { start: 33, length: 0.9, note: 60},
    { start: 34, length: 0.9, note: 67},
    { start: 35, length: 0.9, note: 67},
    { start: 36, length: 0.9, note: 69},
    { start: 37, length: 0.9, note: 69},
    { start: 38, length: 1.9, note: 67},
    { start: 40, length: 0.9, note: 65},
    { start: 41, length: 0.9, note: 65},
    { start: 42, length: 0.9, note: 64},
    { start: 43, length: 0.9, note: 64},
    { start: 44, length: 0.9, note: 62},
    { start: 45, length: 0.9, note: 67},
    { start: 46, length: 4, note: 60}
];

for (const { start, length, note } of twinkleTwinkleLittleStarNotes) {
    transport.scheduleNote(note, start, length);
}

console.log('%cReady!', 'background-color: green; color: white;');