import Sequencer from './sequencer.js';

const transporterDiv = document.querySelector('#transporter');
const pathToFilesystem = './static/';
const controllerSectionDiv = document.querySelector('#controller');
const sequencer = new Sequencer();
await sequencer.start(transporterDiv, pathToFilesystem, controllerSectionDiv);

console.log(sequencer);
console.log('%cReady!', 'background-color: green; color: white;');