import Transporter from './transporter.js';
import Band from './band.js';

export default class Sequencer {
    constructor() {
        this.transporter = new Transporter(this);
        this.band = new Band(this);
    }

    /**
     * Mediate state changes from the band to the transporter
     * @param {object} state - The state to send to the transporter
     */
    sendStateToTransporter(state) {
        this.transporter.receiveState(state);
    }

    /**
     * Starts the transporter and band
     * Creates elements on the page for what we need
     * Loads the first chart, which sends state to the transporter and loads scripts, which sends state to the transporter
     * @param {HTMLDivElement} transporterDiv - The div to append the transporter elements to
     * @param {string} pathToFilesystem - The path to the filesystem
     * @param {HTMLDivElement} controllerDiv - The div to append the controller elements to
     */
    async start(transporterDiv, pathToFilesystem, controllerSectionDiv) {
        this.transporter.start(transporterDiv);
        await this.band.start(pathToFilesystem, controllerSectionDiv);
    }
}

// import Transporter from './transporter.js';
// // import Part from './part.js';
// // import Leader from './leader.js';
// // import { findOrThrow } from './utility.js';
// import Band from './band.js';

// export default class Sequencer {
//     // static partNames = ['bass', 'drum', 'chord', 'lead'];

//     constructor() {
//         this.transporter = new Transporter(this);

//         // this.parts = [
//         //     new Part(this),
//         //     new Part(this),
//         //     new Part(this),
//         //     new Part(this)
//         // ];

//         // this.leader = new Leader(this);

//         this.band = new Band(this);
//     }

//     /**
//      * Mediate button presses from the transporter to the band
//      * @param {string} buttonPressed - The button that was pressed
//      */
//     sendButtonPressToBand(buttonPressed) {
//         this.band.receiveButtonPress(buttonPressed);
//     }

//     sendStateToTransporter(state) {
//         this.transporter.receiveState(state);
//     }

//     // /**
//     //  * Mediate loading information from the leader to a part
//     //  * @param {string} partName - The name of the part to load the information into
//     //  * @param {string} id - The id of the part in the chart
//     //  * @param {Function} script - The script to load into the part
//     //  * @param {object} score - The score to load into the part
//     //  */
//     // sendLoadToPart(partName, id, script, score) {
//     //     findOrThrow(
//     //         this.parts,
//     //         ({ name }) => name === partName,
//     //         `Part ${partName} not found`
//     //     ).load(id, script, score);
//     // }

//     // /**
//     //  * Call the schedule function for each part with the time from the leader
//     //  * @param {number} time - The current time in window.performance.now() milliseconds
//     //  */
//     // scheduleParts(time) {
//     //     this.parts.forEach(part => part.scheduler(time));
//     // }

//     /**
//      * Starts the transporter, parts, and leader
//      * Creates elements on the page for what we need
//      * Loads the first chart, which sends state to the transporter and loads scripts, which sends state to the transporter
//      * @param {HTMLDivElement} transporterDiv - The div to append the transporter elements to
//      * @param {HTMLDivElement} controllerDiv - The div to append the controller elements to
//      * @param {string} pathToFilesystem - The path to the filesystem
//      */
//     async start(transporterDiv, pathToFilesystem, controllerSectionDiv) {
//         this.transporter.start(transporterDiv);

//         // const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

//         // for (const [index, part] of this.parts.entries()) {
//         //     const partName = Sequencer.partNames[index];
//         //     await part.start(partName, midiAccess, controllerSectionDiv);
//         // }

//         // await this.leader.start(pathToFilesystem);

//         await this.band.start(pathToFilesystem, controllerSectionDiv);
//     }
// }