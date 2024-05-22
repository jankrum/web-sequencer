export default class Transporter {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;

        const titleDisplay = document.createElement('p');
        const previousButton = document.createElement('button');
        const playButton = document.createElement('button');
        const pauseButton = document.createElement('button');
        const resumeButton = document.createElement('button');
        const stopButton = document.createElement('button');
        const nextButton = document.createElement('button');

        this.titleDisplay = titleDisplay;
        this.previousButton = previousButton;
        this.playButton = playButton;
        this.pauseButton = pauseButton;
        this.resumeButton = resumeButton;
        this.stopButton = stopButton;
        this.nextButton = nextButton;

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

        this.parentDiv.appendChild(titleDisplay);
        this.parentDiv.appendChild(previousButton);
        this.parentDiv.appendChild(playButton);
        this.parentDiv.appendChild(pauseButton);
        this.parentDiv.appendChild(resumeButton);
        this.parentDiv.appendChild(stopButton);
        this.parentDiv.appendChild(nextButton);
    }

    assignMediator(mediator) {
        mediator.setTransporter(this);

        ['previous', 'play', 'pause', 'resume', 'stop', 'next'].forEach(action => {
            this[`${action}Button`].addEventListener('mousedown', () => {
                mediator.sendButtonPressedFromTransporterToLeader(action);
            });
        });
    }

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