import Synthesizer from './synthesizer.js';
import Controller from './controller.js';

export default class Part {
    static schedulerWindowSize = 100;

    constructor(sequencer) {
        this.sequencer = sequencer;

        this.id = null;
        this.script = null;
        this.score = null;
        this.nextEventTime = 0;
        this.nextEvent = null;

        this.synthesizer = new Synthesizer(this);
        this.controller = new Controller(this);
    }

    /**
     * Receives the loading information from the leader through the sequencer
     * @param {string} id - The id of the part in the chart
     * @param {Function} script - The script that composes the part
     * @param {object} score - The score
     */
    sendLoad(id, script, score) {
        this.id = id;
        this.script = script;
        this.score = score;
    }

    scheduler(time) {
        const endOfSchedulerWindow = time + Part.schedulerWindowSize;

        while (this.nextEventTime < endOfSchedulerWindow) {
            const nextEvent = this.nextEvent;

            switch (nextEvent.type) {
                case 'noteOn':
                    this.currentNotes.push(nextEvent.pitch);
                    this.midiOutput.send([0x90, nextEvent.pitch, 100], this.nextEventTime);
                    break;
                case 'noteOff':
                    this.currentNotes.splice(this.currentNotes.indexOf(nextEvent.pitch), 1);
                    this.midiOutput.send([0x80, nextEvent.pitch, 0], this.nextEventTime);
                    break;
                case 'computed':
                    nextEvent.callback(this.eventBuffer);
                    break;
                default:
                    console.error(`Unknown event type: ${nextEvent.type}`);
                    break;
            }

            this.getNextEvent();
        }
    }

    async start(name, midiAccess, controllerSectionDiv) {
        await this.synthesizer.start(midiAccess, name);
        this.controller.start(controllerSectionDiv, name);
    }
}