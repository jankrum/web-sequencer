export default class Timeline {
    /**
     * Creates a new Timeline object
     * @param {Element} playButton 
     * @param {Element} pauseButton 
     * @param {Element} resumeButton 
     * @param {Element} stopButton 
     * @param {MIDIOutput} midiOutput 
     */
    constructor(playButton, pauseButton, resumeButton, stopButton, midiOutput) {
        // UI
        this.playButton = playButton;
        this.pauseButton = pauseButton;
        this.resumeButton = resumeButton;
        this.stopButton = stopButton;
        playButton.disabled = false;
        pauseButton.disabled = true;
        resumeButton.disabled = true;
        stopButton.disabled = true;
        playButton.addEventListener('mousedown', this.play);
        pauseButton.addEventListener('mousedown', this.pause);
        resumeButton.addEventListener('mousedown', this.resume);
        stopButton.addEventListener('mousedown', this.stop);

        // MIDI
        this.midiOutput = midiOutput;

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
     * Sets the tempo of the playback
     * @param {Number} tempo 
     */
    setTempo = (tempo) => {
        this.millisecondsPerBeat = 60000.0 / tempo;
    }

    /**
     * Adds a defined note's on and off events to the chart
     * @param {Number} pitch 
     * @param {Number} start 
     * @param {Number} length
     */
    addNoteToChart = (pitch, start, length) => {
        if (typeof pitch === 'number') {
            this.chart.push({
                type: 'noteOn',
                pitch,
                position: start
            });
            this.chart.push({
                type: 'noteOff',
                pitch,
                position: start + length
            });
        } else if (typeof pitch === 'function') {
            this.chart.push({
                type: 'abstractNoteOn',
                pitch,
                position: start,
                length
            });
        }
    }
    
    /**
     * Runs every tick to schedule events
     */
    scheduler() {
        while (this.playing && this.seeIfWeNeedToSchedule()) {
            this.scheduleEvent();
        }
    }

    /**
     * Checks to see if there is an event scheduled within the scheduler window
     * @returns {Boolean} Whether we need to schedule an event
     */
    seeIfWeNeedToSchedule() {
        const endOfSchedulerWindow = window.performance.now() + this.schedulerWindowSize;

        return this.nextEventTime < endOfSchedulerWindow;
    }

    /**
     * Schedules the next event
     */
    scheduleEvent() {
        const event = this.nextEvent;

        if (event.type === 'noteOn') {
            this.currentNotes.push(event.pitch);
            this.midiOutput.send([0x90, event.pitch, 0x7f], this.nextEventTime);
        } else if (event.type === 'noteOff') {
            this.midiOutput.send([0x80, event.pitch, 0x00], this.nextEventTime);
            this.currentNotes.splice(this.currentNotes.indexOf(event.pitch), 1);
        } else if (event.type === 'abstractNoteOn') {
            // Reify the abstract note on event
            const pitch = event.pitch();

            /// Insert the note off event into the event buffer, which has to be sorted by position
            const noteOffPosition = event.position + event.length;
            const indexOfEventAfterNoteOff = this.eventBuffer.findIndex(e => e.position > noteOffPosition);

            // If there is no event after the note off event, push it to the end
            if (indexOfEventAfterNoteOff === -1) {
                this.eventBuffer.push({
                    type: 'noteOff',
                    pitch,
                    position: noteOffPosition
                });
            } else {
                this.eventBuffer.splice(indexOfEventAfterNoteOff, 0, {
                    type: 'noteOff',
                    pitch,
                    position: noteOffPosition
                });
            }

            // Regular note on stuff
            this.currentNotes.push(pitch);
            this.midiOutput.send([0x90, pitch, 0x7f], this.nextEventTime);
        }

        this.getNextEvent();
    }

    /**
     * Gets the next event from the event buffer
     */
    getNextEvent() {
        // Get the next event if there is one
        if (this.eventBuffer.length) {
            this.nextEvent = this.eventBuffer.shift();
            this.nextEventTime = (this.nextEvent.position * this.millisecondsPerBeat) + this.startTime;
        } else {
            console.log('No more events to schedule!');

            this.playing = false;
            const millisecondsToLastEvent = this.nextEventTime - window.performance.now();
            setTimeout(this.stop, millisecondsToLastEvent);
            return false;
        }
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