import Sequencer from './sequencer.js';

const transporterDiv = document.querySelector('#transporter');
const controllerSectionDiv = document.querySelector('#controller');
const pathToFilesystem = './static/';
const sequencer = new Sequencer();
await sequencer.start(transporterDiv, controllerSectionDiv, pathToFilesystem);

console.log(sequencer);

console.log('%cReady!', 'background-color: green; color: white;');