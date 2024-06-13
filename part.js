import Synthesizer from './synthesizer.js';
import Controller from './controller.js';

export default class Part {
    constructor(sequencer) {
        this.sequencer = sequencer;
        this.synthesizer = new Synthesizer(this);
        this.controller = new Controller(this);
    }

    sendLoad(id, script, score) {
        this.synthesizer.load(id, script);
        this.controller.load(score);
    }

    async start(name, midiAccess, controllerSectionDiv) {
        await this.synthesizer.start(midiAccess, name);
        this.controller.start(controllerSectionDiv, name);
    }
}