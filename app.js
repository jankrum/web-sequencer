import Mediator from './mediator.js';
import Sequencer from './sequencer.js';
import Transporter from './transporter.js';
import Controller from './controller.js';

const partNames = ['bass', 'drum', 'chord', 'lead'];

// Do what we can with zero knowledge
const mediator = new Mediator();
const sequencer = new Sequencer(mediator);
const transporter = new Transporter(mediator);
const controllers = Object.fromEntries(partNames.map(partName => [partName, new Controller(mediator, partName)]));
mediator.assign(sequencer, transporter, controllers);

const pathToFilesystem = './static';
const transporterDiv = document.querySelector('#transporter');
const controllerSectionDiv = document.querySelector('#controllerSection');

// We set these up first so that when the sequencer starts, there are things to send state to
transporter.start(transporterDiv);
Object.values(controllers).foreach(controller => controller.start(controllerSectionDiv));

await sequencer.start(pathToFilesystem, partNames);