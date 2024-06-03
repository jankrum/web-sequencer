import { documentMake } from "./utility.js";

export default class Transporter {
    constructor(sequencer) {
        this.sequencer = sequencer;

        // Referenced by start and receiveState
        this.titleDisplay = null;
        this.previousButton = null;
        this.playButton = null;
        this.pauseButton = null;
        this.resumeButton = null;
        this.stopButton = null;
        this.nextButton = null;
    }

    /**
     * Receives the state from the leader and updates the transporter elements
     * @param {Object} param0 - The state object from the leader
     */
    receiveState({ title, canPrevious, transporterState, canNext }) {
        this.titleDisplay.innerText = title;
        this.previousButton.disabled = !canPrevious;
        switch (transporterState) {
            case 'playing':
                this.playButton.disabled = true;
                this.pauseButton.disabled = false;
                this.resumeButton.disabled = true;
                this.stopButton.disabled = false;
                break;
            case 'paused':
                this.playButton.disabled = true;
                this.pauseButton.disabled = true;
                this.resumeButton.disabled = false;
                this.stopButton.disabled = false;
                break;
            case 'stopped':
                this.playButton.disabled = false;
                this.pauseButton.disabled = true;
                this.resumeButton.disabled = true;
                this.stopButton.disabled = true;
                break;
        }
        this.nextButton.disabled = !canNext;
    }

    /**
     * Makes the transporter elements and appends them to the parent div, then sets up the button presses
     * @param {HTMLDivElement} parentDiv - The div to append the transporter elements to
     */
    start(parentDiv) {
        // Make the elements and append them to the parent div
        parentDiv.append(
            this.titleDisplay = documentMake('p', { innerText: '%%EMPTY%%' }),
            documentMake('div', {}, [
                this.previousButton = documentMake('button', { innerText: '<-', disabled: true }),
                this.playButton = documentMake('button', { innerText: 'Play', disabled: true }),
                this.pauseButton = documentMake('button', { innerText: 'Pause', disabled: true }),
                this.resumeButton = documentMake('button', { innerText: 'Resume', disabled: true }),
                this.stopButton = documentMake('button', { innerText: 'Stop', disabled: true }),
                this.nextButton = documentMake('button', { innerText: '->', disabled: true })
            ])
        );

        // Sends the button press to the leader through the mediator
        ['previous', 'play', 'pause', 'resume', 'stop', 'next'].forEach(action => {
            this[`${action}Button`].addEventListener('mousedown', () => {
                this.sequencer.leader.sendButtonPressedFromTransporterToLeader(action);
            });
        });
    }
}