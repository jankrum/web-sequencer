import Part from './part.js';

export default class Band {
    static partNames = ['bass', 'drum', 'chord', 'lead'];

    constructor(sequencer) {
        this.sequencer = sequencer;

        this.setlist = null;
        this.chartIndex = 0;
        this.numberOfCharts = null;
        this.currentState = 'stopped';
        this.currentChart = null;
        this.startTime = null;
        this.elapsedTime = 0;

        this.schedulerWorker = null;

        this.parts = Band.partNames.map(partName => new Part(this, partName));

        this.pathToFilesystem = '';
    }

    updateTransporter() {
        const title = this.currentChart.title;
        const canPrevious = this.chartIndex > 0;
        const canNext = this.chartIndex < this.numberOfCharts - 1;
        const transporterState = this.currentState;

        const state = {
            title,
            canPrevious,
            canNext,
            transporterState
        };

        this.sequencer.sendStateToTransporter(state);
    }

    async receiveButtonPress(buttonPressed) {
        switch (buttonPressed) {
            case 'previous':
                this.chartIndex -= 1;
                await this.load();
                break;
            case 'play':
                this.play()
                break;
            case 'pause':
                this.pause();
                break;
            case 'resume':
                this.resume();
                break;
            case 'stop':
                this.stop();
                this.runScript();
                break;
            case 'next':
                this.chartIndex += 1;
                await this.load();
                break;
        }

        this.updateTransporter();
    }

    async getTextFile(path) {
        return await fetch(this.pathToFilesystem + path).then(response => response.text());
    }

    async load() {
        this.stop();

        const chartName = this.setlist[this.chartIndex];
        const chartPath = `$/charts/${chartName}.json`
        const chartText = await getTextFile(chartPath);
        const chart = this.currentChart = JSON.parse(chartText);

        this.parts.forEach(part => part.load(chart));
    }

    async start(pathToFilesystem, controllerSectionDiv) {
        this.pathToFilesystem = pathToFilesystem;

        const midiAccess = await navigator.requestMIDIAccess();
        Promise.all(this.parts.map(part => part.start(midiAccess, controllerSectionDiv)));

        setlistText = await fetch(`${pathToFilesystem}setlist.text`).then(response => response.text());
        this.setlist = setlistText.split('\n').filter(line => line.trim() !== '');
        this.numberOfCharts = this.setlist.length;

        await this.load();

        this.updateTransporter();
    }
}