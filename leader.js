import Part from './part.js';

async function getSetlist() {
    const setlistLines = await fetch('./static/setlist.txt').then(response => response.text());
    return setlistLines.split('\n');
}

export default class Leader {
    constructor() {
        this.mediator = null;
        this.setlist = null;
        this.chartIndex = 0;
        this.numberOfCharts = 0;

        this.parts = {};
        this.partsInUse = [];
        this.currentChart = null;
    }

    // This is called by the mediator to set the mediator
    assignMediator(mediator) {
        this.mediator = mediator;
        mediator.setLeader(this);
    }

    // This is called by the mediator to receive a button press from the transporter
    receiveTransporterButtonPress(buttonPressed) {
        console.log(`Button pressed: ${buttonPressed}`);
    }

    async start() {
        this.setlist = await getSetlist();
        this.numberOfCharts = this.setlist.length;

        await this.load();
    }

    async load() {
        const chartName = this.setlist[this.chartIndex];
        const chartPath = `./static/charts/${chartName}.json`
        console.log(chartPath);
        const chart = await fetch(chartPath).then(response => response.json());
        console.log(chart);
    }

    async getPart(partName) {
        if (this.parts[partName]) {
            return this.parts[partName];
        }

        const newPart = new Part(partName);

        await newPart.load();

        this.parts[partName] = newPart;

        return newPart;
    }
}