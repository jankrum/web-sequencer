import mediate from "./mediate.js";
import Transporter from './transporter.js';
import Controller from './controller.js';
import Leader from './leader.js';

const transporterDiv = document.querySelector('#transporter');
const transporter = new Transporter(transporterDiv);

const controllerDiv = document.querySelector('#controller');
const controller = new Controller(controllerDiv, false, 1);

const leader = new Leader();

mediate(transporter, controller, leader);

await leader.start();

console.log('%cReady!', 'background-color: green; color: white;');