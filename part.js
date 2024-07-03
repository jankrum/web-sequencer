import Synthesizer from './synthesizer.js';
import Controller from './controller.js';

export default class Part {
    // static schedulerWindowSize = 100;

    constructor(band, name) {
        this.band = band;
        this.name = name;

        this.chart = null;

        this.synthesizer = new Synthesizer(this);
        this.controller = new Controller(this);
    }

    load(chart) {
        this.chart = chart;
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

    async start(midiAccess, controllerSectionDiv) {
        await this.synthesizer.start(midiAccess, this.name);
        this.controller.start(controllerSectionDiv, this.name);
    }
}