import Transporter from './transporter.js';
import Part from './part.js';
// import Leader from './leader.js';

export default class Sequencer {
    static partNames = ['bass', 'drum', 'chord', 'lead'];

    constructor() {
        this.transporter = new Transporter(this);

        this.parts = [
            new Part(this),
            new Part(this),
            new Part(this),
            new Part(this)
        ];

        // this.leader = new Leader(this);
    }

    /**
     * Starts the transporter, parts, and leader
     * Creates elements on the page for what we need
     * Loads the first chart, which sends state to the transporter and loads scripts, which sends state to the transporter
     * @param {HTMLDivElement} transporterDiv - The div to append the transporter elements to
     * @param {HTMLDivElement} controllerDiv - The div to append the controller elements to
     */
    async start(transporterDiv, controllerSectionDiv) {
        this.transporter.start(transporterDiv);

        const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

        async function startPart(part, index) {
            return await part.start(Sequencer.partNames[index], midiAccess, controllerSectionDiv);
        }

        await Promise.all(this.parts.map(startPart));

        // await this.leader.start();
    }
}