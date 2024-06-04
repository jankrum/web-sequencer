import Controller from './controller.js';

export default class Part {
    constructor(sequencer, name) {
        this.sequencer = sequencer;
        this.name = name;
        this.controller = null;
    }

    async start(controllerSectionDiv) {
        const name = this.name;

        const controller = this.controller = new Controller(this);
        controller.start(controllerSectionDiv, name);
    }
}