import Sequencer from './sequencer.js';

const transporterDiv = document.querySelector('#transporter');
const controllerDiv = document.querySelector('#controller');
const sequencer = new Sequencer();
await sequencer.start(transporterDiv, controllerDiv);

console.log('%cReady!', 'background-color: green; color: white;');