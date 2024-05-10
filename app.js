import getConnection from '/get-connection.js';

const SELECTORS = {
    playButton: '#play-button',
    pauseButton: '#pause-button',
    stopButton: '#stop-button'
};

let playing = false;
let output = null;
let startTime = null;  // The start time of the entire sequence.
let tempo = 300.0;  // Tempo (beats per minute)
let millisecondsPerBeat = 60000.0 / tempo;  // How many milliseconds per beat
let tickRate = 25.0;  // How frequently to call scheduling function (milliseconds)
let schedulerWindowSize = 100.0;  // How far ahead to schedule audio (milliseconds)
let nextEvent = null;
let nextEventTime = 0.0;
const eventBuffer = [];  // The note buffer
const currentNotes = [];  // The notes that are currently playing

let timerWorker = null;  // The Web Worker used to fire timer messages

const twinkleTwinkleLittleStarNotes = [
    {start: 0, length: 1, note: 60},
    {start: 1, length: 1, note: 60},
    {start: 2, length: 1, note: 67},
    {start: 3, length: 1, note: 67},
    {start: 4, length: 1, note: 69},
    {start: 5, length: 1, note: 69},
    {start: 6, length: 2, note: 67},
    {start: 8, length: 1, note: 65},
    {start: 9, length: 1, note: 65},
    {start: 10, length: 1, note: 64},
    {start: 11, length: 1, note: 64},
    {start: 12, length: 1, note: 62},
    {start: 13, length: 1, note: 62},
    {start: 14, length: 2, note: 60},
    {start: 16, length: 1, note: 67},
    {start: 17, length: 1, note: 67},
    {start: 18, length: 1, note: 65},
    {start: 19, length: 1, note: 65},
    {start: 20, length: 1, note: 64},
    {start: 21, length: 1, note: 64},
    {start: 22, length: 2, note: 62},
    {start: 24, length: 1, note: 67},
    {start: 25, length: 1, note: 67},
    {start: 26, length: 1, note: 65},
    {start: 27, length: 1, note: 65},
    {start: 28, length: 1, note: 64},
    {start: 29, length: 1, note: 64},
    {start: 30, length: 2, note: 62},
    {start: 32, length: 1, note: 60},
    {start: 33, length: 1, note: 60},
    {start: 34, length: 1, note: 67},
    {start: 35, length: 1, note: 67},
    {start: 36, length: 1, note: 69},
    {start: 37, length: 1, note: 69},
    {start: 38, length: 2, note: 67},
    {start: 40, length: 1, note: 65},
    {start: 41, length: 1, note: 65},
    {start: 42, length: 1, note: 64},
    {start: 43, length: 1, note: 64},
    {start: 44, length: 1, note: 62},
    {start: 45, length: 1, note: 67},
    {start: 46, length: 8, note: 60}
];

function scheduleEvent({ type, note }) {
    if (type === 'noteOn') {
        currentNotes.push(note);
        output.send([0x90, note, 0x7f], nextEventTime);
    } else if (type === 'noteOff') {
        output.send([0x80, note, 0x00], nextEventTime);
        currentNotes.splice(currentNotes.indexOf(note), 1);
    }
}

function getNextEvent() {
    if (eventBuffer.length) {
        nextEvent = eventBuffer.shift();
        nextEventTime = (nextEvent.position * millisecondsPerBeat) + startTime;
    }
}

function seeIfWeNeedToSchedule() {
    if (!eventBuffer.length) {
        playing = false;
        const millisecondsToLastEvent = nextEventTime - window.performance.now();
        setTimeout(stop, millisecondsToLastEvent);
    }

    const endOfSchedulerWindow = window.performance.now() + schedulerWindowSize;

    if (nextEventTime < endOfSchedulerWindow) {
        scheduleEvent(nextEvent);
        getNextEvent();
    }
}

function scheduler() {
    while (playing && seeIfWeNeedToSchedule()) {
        console.log('We have an event to schedule!')
        scheduleEvent(nextEvent);
        getNextEvent();
    }
}

function play() {
    playing = true;

    while (eventBuffer.length) {
        eventBuffer.shift();
    }

    for (const { start, length, note } of twinkleTwinkleLittleStarNotes) {
        eventBuffer.push({
            type: 'noteOn',
            note,
            position: start
        });
        eventBuffer.push({
            type: 'noteOff',
            note,
            position: start + (length < 0.1 ? length : length - 0.1)
        });
    }

    console.log('LOADED');

    startTime = window.performance.now();
    getNextEvent();

    timerWorker.postMessage('start');

    console.log('PLAYING');
}

function stop() {
    playing = false;

    timerWorker.postMessage('stop');
    
    while (currentNotes.length) {
        output.send([0x80, currentNotes[0], 0x00], window.performance.now() + 500);
        currentNotes.shift();
    }

    console.log('STOPPING');
}

output = await getConnection('synthesizer', 'outputs');

timerWorker = new Worker('metronome-worker.js');

timerWorker.addEventListener('message', function(e) {
    if (e.data === 'tick') {
        scheduler();
    } else {
        console.log('message from worker: ' + e.data);
    }
});

timerWorker.postMessage({'interval': tickRate});

document.querySelector(SELECTORS.playButton).addEventListener('mousedown', play);
document.querySelector(SELECTORS.stopButton).addEventListener('mousedown', stop);

console.log('%cReady!', 'background-color: green; color: white;');