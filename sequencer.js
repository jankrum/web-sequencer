import Transporter from './transporter.js';
import Part from './part.js';
// import Leader from './leader.js';

export default class Sequencer {
    constructor() {
        this.transporter = null;
        this.parts = [];
        this.leader = null;
    }

    /**
     * Starts the transporter, parts, and leader
     * Creates elements on the page for what we need
     * Loads the first chart, which sends state to the transporter and loads scripts, which sends state to the transporter
     * @param {HTMLDivElement} transporterDiv - The div to append the transporter elements to
     * @param {HTMLDivElement} controllerDiv - The div to append the controller elements to
     */
    async start(transporterDiv, controllerSectionDiv) {
        const transporter = this.transporter = new Transporter(this);
        const parts = this.parts = [
            new Part(this, 'bass'),
            new Part(this, 'drum'),
            new Part(this, 'chord'),
            new Part(this, 'lead')
        ];
        // const leader = this.leader = new Leader(this);

        // const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

        transporter.start(transporterDiv);
        await Promise.all(parts.map(part => part.start(controllerSectionDiv)));
        // await leader.start();
    }
}