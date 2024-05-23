async function getTextFile(path) {
    return await fetch(path).then(response => response.text());
}

async function getSetlist() {
    const setlistPath = './static/setlist.txt';
    return (await getTextFile(setlistPath)).split('\n');
}

export default class Leader {
    // Creates the values we reference between methods 
    constructor() {
        this.mediator = null;

        this.setlist = null;
        this.chartIndex = 0;
        this.numberOfCharts = 0;

        this.currentChart = null;
        this.currentState = 'stopped';
    }

    // This is called by the mediator to set the mediator
    assignMediator(mediator) {
        this.mediator = mediator;
        mediator.setLeader(this);
    }

    sendTransporterState() {
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

        this.mediator.sendStateFromLeaderToTransporter(state);
    }

    // This is called by the mediator to receive a button press from the transporter
    receiveTransporterButtonPress(buttonPressed) {
        switch (buttonPressed) {
            case 'previous':
                this.chartIndex -= 1;
                this.load();
                return;
            case 'next':
                this.chartIndex += 1;
                this.load();
                return;
        }

        this.sendTransporterState();
    }

    // Gets the setlist, then loads the first chart
    async start() {
        this.setlist = await getSetlist();
        this.numberOfCharts = this.setlist.length;

        await this.load();
    }

    async load() {
        console.log('Loading chart...');
        console.log('Setlist:');
        console.log(this.setlist);

        const chartName = this.setlist[this.chartIndex];
        const chartPath = `./static/charts/${chartName}.json`
        const chartText = await getTextFile(chartPath);
        const chart = JSON.parse(chartText);
        this.currentChart = chart;
        const scriptName = chart.scriptName;
        const scriptPath = `./static/scripts/${scriptName}.js`;
        const scriptText = await getTextFile(scriptPath);

        // console.log('Chart:');
        // console.log(chart);
        // console.log('Script:');
        // console.log(script);

        this.sendTransporterState();
    }
}