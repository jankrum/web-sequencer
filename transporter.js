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
     * @param {string} title - The title to display
     * @param {boolean} canPrevious - Whether the previous button should be enabled
     * @param {string} transporterState - The state of the transporter
     * @param {boolean} canNext - Whether the next button should be enabled
     */
    receiveState(title, canPrevious, transporterState, canNext) {
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
        const buttons = [
            this.previousButton = documentMake('button', { value: 'previous', innerText: '<-', disabled: true }),
            this.playButton = documentMake('button', { value: 'play', innerText: 'Play', disabled: true }),
            this.pauseButton = documentMake('button', { value: 'pause', innerText: 'Pause', disabled: true }),
            this.resumeButton = documentMake('button', { value: 'resume', innerText: 'Resume', disabled: true }),
            this.stopButton = documentMake('button', { value: 'stop', innerText: 'Stop', disabled: true }),
            this.nextButton = documentMake('button', { value: 'next', innerText: '->', disabled: true })
        ];

        buttons.forEach(button => {
            const { value } = button;
            button.addEventListener('mousedown', () => {
                this.sequencer.leader.sendButtonPressedFromTransporterToLeader(value);
            });
        });

        parentDiv.append(
            this.titleDisplay = documentMake('p', { innerText: '%%EMPTY%%' }),
            documentMake('div', {}, buttons)
        );
    }
}