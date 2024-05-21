import { insertEventInOrder, convertPositionToBeat, convertPitchNameToMidiNumber } from './utility.js';

export default class Leader {
    /**
     * Creates a new Leader object
     * @param {Element} playButton 
     * @param {Element} pauseButton 
     * @param {Element} resumeButton 
     * @param {Element} stopButton 
     * @param {MIDIOutput} midiOutput 
     */
    constructor(playButton, pauseButton, resumeButton, stopButton) {
        // UI
        this.playButton = playButton;
        this.pauseButton = pauseButton;
        this.resumeButton = resumeButton;
        this.stopButton = stopButton;
        playButton.disabled = true;
        pauseButton.disabled = true;
        resumeButton.disabled = true;
        stopButton.disabled = true;
        playButton.addEventListener('mousedown', this.play);
        pauseButton.addEventListener('mousedown', this.pause);
        resumeButton.addEventListener('mousedown', this.resume);
        stopButton.addEventListener('mousedown', this.stop);

        // Logic for playback
        this.playing = false;
        this.chart = [];  // The events we will play
        this.eventBuffer = [];  // The events about to happen
        this.currentNotes = [];  // The notes currently playing
        this.startTime = null;  // The time we started playing
        this.millisecondsPerBeat = 500;  // The reciprocal of the tempo
        this.nextEvent = null;  // The next event to schedule
        this.nextTime = null;  // The time of the next event
        this.elapsedTime = 0;  // The time since we started playing
        this.midiOutput = null;  // The MIDI output
        this.controller = null;  // The controller
        
        // Web Worker
        this.schedulerWindowSize = 100;  // The number of milliseconds to look ahead for scheduling
        this.schedulerWorker = new Worker('scheduler-worker.js');
        this.schedulerWorker.addEventListener('message', e => {
            if (e.data === 'tick') {
                this.scheduler();
            }
        });
    }

    /**
     * Creates a part
     * In the future, this will also take in a part name
     * @param {MIDIOutput} output 
     * @param {Controller} controller 
     */
    createPart(output, controller) {
        this.midiOutput = output;
        this.controller = controller;
    }
    
    load(chart, script) {
        const controller = this.controller;
        const transformerFunction = eval(script);
        const transformedChart = transformerFunction(chart, controller);

        this.chart = transformedChart;

        this.playButton.disabled = false;
        // console.log('Loaded');
    }
    
    /**
     * Runs every tick to schedule events
     */
    scheduler() {
        const endOfSchedulerWindow = window.performance.now() + this.schedulerWindowSize

        while (this.playing && this.nextEventTime < endOfSchedulerWindow) {
            this.scheduleEvent();
        }
    }

    /**
     * Schedules the next event
     */
    scheduleEvent() {
        const [event, position] = this.nextEvent;

        // console.log('Event to schedule:');
        // console.log(event);

        switch (event.type) {
            case 'tempo':
                const bpm = event.bpm;
                this.millisecondsPerBeat = 60000 / bpm;
                break;
            case 'note':
                const pitch = event.pitch;
                const duration = event.duration;
                const midiPitch = convertPitchNameToMidiNumber(pitch);

                this.currentNotes.push(midiPitch);

                const noteOffEvent = {
                    type: 'noteOff',
                    midiPitch
                };
                const noteOffPosition = [(position[0] || 0), ((position[1] || 0) + duration), (position[2] || 0)];
                insertEventInOrder([noteOffEvent, noteOffPosition], this.eventBuffer);

                this.midiOutput.send([0x90, midiPitch, 0x7f], this.nextEventTime);
                break;
            case 'noteOff':
                this.midiOutput.send([0x80, event.midiPitch, 0x00], this.nextEventTime);
                this.currentNotes.splice(this.currentNotes.indexOf(event.pitch), 1);
                break;
            case 'computed':
                event.callback(this.eventBuffer);
                break;
            case 'stop':
                this.stop();
                return;
            default:
                console.error(`Unknown event type: ${event.type}`);
                break;
        }

        // if (event.type === 'note') {
        //     const midiPitch = convertPitchNameToMidiNumber(event.pitch);
        //     insertEventInOrder([{type: 'noteOff', pitch: event.pitch}, ], this.eventBuffer);
        //     this.currentNotes.push(midiPitch);

        //     this.midiOutput.send([0x90, midiPitch, 0x7f], this.nextEventTime);
        // } else if (event.type === 'noteOff') {
        //     this.midiOutput.send([0x80, event.pitch, 0x00], this.nextEventTime);
        //     this.currentNotes.splice(this.currentNotes.indexOf(event.pitch), 1);
        // } else if (event.type === 'abstractNoteOn') {
        //     // Reify the abstract note on event
        //     const pitch = event.pitch();

        //     /// Insert the note off event into the event buffer, which has to be sorted by position
        //     const noteOffPosition = event.position + event.length;
        //     const indexOfEventAfterNoteOff = this.eventBuffer.findIndex(e => e.position > noteOffPosition);

        //     // If there is no event after the note off event, push it to the end
        //     if (indexOfEventAfterNoteOff === -1) {
        //         this.eventBuffer.push({
        //             type: 'noteOff',
        //             pitch,
        //             position: noteOffPosition
        //         });
        //     } else {
        //         this.eventBuffer.splice(indexOfEventAfterNoteOff, 0, {
        //             type: 'noteOff',
        //             pitch,
        //             position: noteOffPosition
        //         });
        //     }

        //     // Regular note on stuff
        //     this.currentNotes.push(pitch);
        //     this.midiOutput.send([0x90, pitch, 0x7f], this.nextEventTime);
        // }

        this.getNextEvent();
    }

    /**
     * Gets the next event from the event buffer
     */
    getNextEvent() {
        // Get the next event if there is one
        this.nextEvent = this.eventBuffer.shift();
        const position = convertPositionToBeat(this.nextEvent[1]);
        this.nextEventTime = (position * this.millisecondsPerBeat) + this.startTime;
    }

    /**
     * Starts playback
     */
    play = () => {
        this.playing = true;

        // Clear the event buffer
        this.eventBuffer = [];

        // Copy the chart to the event buffer
        for (const element of this.chart) {
            this.eventBuffer.push(element);
        }

        // console.log('Chart:');
        // console.log(this.chart);
        // console.log('First event:');
        // console.log(this.eventBuffer[0]);

        this.startTime = window.performance.now();
        this.getNextEvent();  // Needs to be called after startTime is set        

        // Start the worker, which will run the scheduler
        this.schedulerWorker.postMessage('start');

        this.playButton.disabled = true;
        this.pauseButton.disabled = false;
        this.resumeButton.disabled = true;
        this.stopButton.disabled = false;

        console.log('Playing!');
    }

    /**
     * Pauses playback
     */
    pause = () => {
        this.playing = false;

        // Stop the worker right away so we don't schedule any more events
        this.schedulerWorker.postMessage('stop');

        // Find out how much time has elapsed since we started playing
        this.elapsedTime = window.performance.now() - this.startTime;

        // The notes we want to stop may be scheduled but not playing yet
        const twoSchedulerWindowsFromNow = window.performance.now() + (this.schedulerWindowSize * 2);

        // Stop the notes that are currently playing
        for (const note of this.currentNotes) {
            this.midiOutput.send([0x80, note, 0x00], twoSchedulerWindowsFromNow);
        }

        this.playButton.disabled = true;
        this.pauseButton.disabled = true;
        this.resumeButton.disabled = false;
        this.stopButton.disabled = false;

        console.log('Paused!');
    }
    
    /**
     * Resumes playback
     */
    resume = () => {
        this.playing = true;

        // Compute the new start time based on the elapsed time
        this.startTime = window.performance.now() - this.elapsedTime;

        for (const note of this.currentNotes) {
            this.midiOutput.send([0x90, note, 0x7f]);
        }

        // Start the worker, which will run the scheduler
        this.schedulerWorker.postMessage('start');

        this.playButton.disabled = true;
        this.pauseButton.disabled = false;
        this.resumeButton.disabled = true;
        this.stopButton.disabled = false;

        console.log('Resumed!');
    }

    /**
     * Stops playback
     */
    stop = () => {
        this.playing = false;
        
        // Stop the worker right away so we don't schedule any more events
        this.schedulerWorker.postMessage('stop');
        
        // The notes we want to stop may be scheduled but not playing yet
        const twoSchedulerWindowsFromNow = window.performance.now() + (this.schedulerWindowSize * 2);
        
        // Stop the notes that are currently playing and remove them from the currentNotes array
        while (this.currentNotes.length) {
            this.midiOutput.send([0x80, this.currentNotes.pop(), 0x00], twoSchedulerWindowsFromNow);
        }
        
        // Clear the event buffer
        this.eventBuffer = [];

        this.playButton.disabled = false;
        this.pauseButton.disabled = true;
        this.resumeButton.disabled = true;
        this.stopButton.disabled = true;

        console.log('Stopped!');
    }
}