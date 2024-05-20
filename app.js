// import getConnection from './get-connection.js';  // Used to get midi connections
// import Timeline from './timeline.js';  // Used to control playback
import Controller from './controller.js';  // Used to make the controller

// // Get the output to the synthesizer
// const synthesizerOutput = await getConnection('synthesizer', 'outputs');

// const timeline = new Timeline(
//     document.querySelector('#play-button'),
//     document.querySelector('#pause-button'),
//     document.querySelector('#resume-button'),
//     document.querySelector('#stop-button'),
//     synthesizerOutput
// );

// const chart = await fetch('./static/twinkle-twinkle-little-star.json').then(response => response.json());
// const script = await fetch('./static/octave-jumper.js').then(response => response.text());

const controllerDiv = document.querySelector('#controller');
const controller = new Controller(controllerDiv, true, 3);

controller.clear();

// Don't judge me for this
const pitchRange = [[2, 3, 4].map(octave => ['C', 'D', 'E', 'F#', 'G', 'A', 'B'].map(letter => `${letter}${octave}`)), 'C5'].flat(2);

const repeatControl = controller.makeOptionController('Repeat again: ', ['No', 'Yes']);
const tempoControl = controller.makeRangeController('Tempo: ', 40, 240, ' bpm');
const pitchControl = controller.makeOptionController('Pitch: ', pitchRange);

// const newChart = eval(script)(chart);
// console.log(newChart.notes[0].pitch());

// for (const note of newChart.notes) {
//     timeline.addNoteToChart(note.pitch, note.start, note.duration);
// }
    
console.log('%cReady!', 'background-color: green; color: white;');