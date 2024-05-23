export default class Transporter {
    // Things we need the reference between methods
    constructor() {
        this.titleDisplay = null;
        this.previousButton = null;
        this.playButton = null;
        this.pauseButton = null;
        this.resumeButton = null;
        this.stopButton = null;
        this.nextButton = null;
    }

    // Called by app.js to set up the transporter's elements
    addTransporterElements(parentDiv) {
        // Create the elements
        const titleDisplay = document.createElement('p');
        const previousButton = document.createElement('button');
        const playButton = document.createElement('button');
        const pauseButton = document.createElement('button');
        const resumeButton = document.createElement('button');
        const stopButton = document.createElement('button');
        const nextButton = document.createElement('button');

        // Store the elements for later
        this.titleDisplay = titleDisplay;
        this.previousButton = previousButton;
        this.playButton = playButton;
        this.pauseButton = pauseButton;
        this.resumeButton = resumeButton;
        this.stopButton = stopButton;
        this.nextButton = nextButton;

        // Set the text and disabled state of the elements
        titleDisplay.innerText = '%%EMPTY%%';
        previousButton.innerText = '<-';
        previousButton.disabled = true;
        playButton.innerText = 'Play';
        playButton.disabled = true;
        pauseButton.innerText = 'Pause';
        pauseButton.disabled = true;
        resumeButton.innerText = 'Resume';
        resumeButton.disabled = true;
        stopButton.innerText = 'Stop';
        stopButton.disabled = true;
        nextButton.innerText = '->';
        nextButton.disabled = true;

        // Add the elements to the parent div
        parentDiv.appendChild(titleDisplay);
        parentDiv.appendChild(previousButton);
        parentDiv.appendChild(playButton);
        parentDiv.appendChild(pauseButton);
        parentDiv.appendChild(resumeButton);
        parentDiv.appendChild(stopButton);
        parentDiv.appendChild(nextButton);
    }

    // Called by the mediator to assign the mediator's transporter and set up event listeners
    assignMediator(mediator) {
        // The mediator will use this to send state to the transporter
        mediator.setTransporter(this);

        // Sends the button press to the leader through the mediator
        ['previous', 'play', 'pause', 'resume', 'stop', 'next'].forEach(action => {
            this[`${action}Button`].addEventListener('mousedown', () => {
                mediator.sendButtonPressedFromTransporterToLeader(action);
            });
        });
    }

    // Called by the mediator to send state to the transporter
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
}