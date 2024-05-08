import getConnection from '/get-connection.js';

const SELECTORS = {
    playButton: '#play-button',
    pauseButton: '#pause-button',
    stopButton: '#stop-button'
};


//--------------------- CODE THAT ACTUALLY IS EXECUTED ------------------------
const output = await getConnection('synthesizer', 'outputs');
const twinkle = [
    {start: 0, length: 1, note: 60},
    {start: 1, length: 1, note: 60},
    {start: 2, length: 1, note: 67},
    {start: 3, length: 1, note: 67},
    {start: 4, length: 1, note: 69},
    {start: 5, length: 1, note: 69},
    {start: 6, length: 1, note: 67},
    {start: 7, length: 1, note: 65},
    {start: 8, length: 1, note: 65},
    {start: 9, length: 1, note: 64},
    {start: 10, length: 1, note: 64},
    {start: 11, length: 1, note: 62},
    {start: 12, length: 1, note: 62},
    {start: 13, length: 1, note: 60},
    {start: 14, length: 1, note: 67},
    {start: 15, length: 1, note: 67},
    {start: 16, length: 1, note: 65},
    {start: 17, length: 1, note: 65},
    {start: 18, length: 1, note: 64},
    {start: 19, length: 1, note: 64},
    {start: 20, length: 1, note: 62},
    {start: 21, length: 1, note: 67},
    {start: 22, length: 1, note: 67},
    {start: 23, length: 1, note: 65},
    {start: 24, length: 1, note: 65},
    {start: 25, length: 1, note: 64},
    {start: 26, length: 1, note: 64},
    {start: 27, length: 1, note: 62},
    {start: 28, length: 1, note: 60},
    {start: 29, length: 1, note: 60},
    {start: 30, length: 1, note: 67},
    {start: 31, length: 1, note: 67},
    {start: 32, length: 1, note: 69},
    {start: 33, length: 1, note: 69},
    {start: 34, length: 1, note: 67},
    {start: 35, length: 1, note: 65},
    {start: 36, length: 1, note: 65},
    {start: 37, length: 1, note: 64},
    {start: 38, length: 1, note: 64},
    {start: 39, length: 1, note: 62},
    {start: 40, length: 1, note: 62},
    {start: 41, length: 1, note: 60}
];

const tempo = 120;
const millisecondsPerBeat = 60000 / tempo;

twinkle.forEach(note => {
    output.send([0x90, note.note, 0x7f], window.performance.now() + millisecondsPerBeat * note.start);
    output.send([0x80, note.note, 0x00], window.performance.now() + millisecondsPerBeat * (note.start + note.length));
});

console.log('Done lol');