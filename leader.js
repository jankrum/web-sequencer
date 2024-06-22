// import getConnection from './get-connection.js';
// import helper from './helper.js';

async function getTextFile(path) {
    return await fetch(path).then(response => response.text());
}

// async function getSetlist() {
//     const setlistPath = './static/setlist.txt';
//     return (await getTextFile(setlistPath)).split('\n');
// }

// export default class Leader {
//     // Creates the values we reference between methods 
//     constructor() {
//         this.mediator = null;

//         this.setlist = null;
//         this.chartIndex = 0;
//         this.numberOfCharts = null;
//         this.currentState = 'stopped';
//         this.currentChart = null;
//         this.scriptText = null;
//         this.eventBuffer = null;
//         this.currentNotes = [];
//         this.startTime = null;
//         this.millisecondsPerBeat = 500;
//         this.nextEvent = null;
//         this.nextTime = null;
//         this.elapsedTime = 0;

//         this.schedulerWindowSize = 100;
//         this.schedulerWorker = new Worker('scheduler-worker.js');
//         this.schedulerWorker = new Worker('scheduler-worker.js');
//         this.schedulerWorker.addEventListener('message', e => {
//             if (e.data === 'tick') {
//                 this.scheduler();
//             }
//         });

//         this.midiOutput = null;
//     }

//     scheduler() {
//         const endOfSchedulerWindow = window.performance.now() + this.schedulerWindowSize

//         while (this.currentState === 'playing' && this.nextEventTime < endOfSchedulerWindow) {
//             const nextEvent = this.nextEvent;

//             switch (nextEvent.type) {
//                 case 'tempo':
//                     this.millisecondsPerBeat = 60000 / this.nextEvent.bpm;
//                     break;
//                 case 'noteOn':
//                     this.currentNotes.push(nextEvent.pitch);
//                     this.midiOutput.send([0x90, nextEvent.pitch, 100], this.nextEventTime);
//                     break;
//                 case 'noteOff':
//                     this.currentNotes.splice(this.currentNotes.indexOf(nextEvent.pitch), 1);
//                     this.midiOutput.send([0x80, nextEvent.pitch, 0], this.nextEventTime);
//                     break;
//                 case 'computed':
//                     nextEvent.callback(this.eventBuffer);
//                     break;
//                 case 'stop':
//                     this.stop();
//                     this.runScript();
//                     this.sendTransporterState();
//                     break;
//                 default:
//                     console.error(`Unknown event type: ${nextEvent.type}`);
//                     break;
//             }

//             this.getNextEvent();
//         }
//     }

//     // This is called by the mediator to set the mediator
//     assignMediator(mediator) {
//         this.mediator = mediator;
//         mediator.setLeader(this);
//     }

//     sendTransporterState() {
//         const title = this.currentChart.title;
//         const canPrevious = this.chartIndex > 0;
//         const canNext = this.chartIndex < this.numberOfCharts - 1;
//         const transporterState = this.currentState;

//         const state = {
//             title,
//             canPrevious,
//             canNext,
//             transporterState
//         };

//         this.mediator.sendStateFromLeaderToTransporter(state);
//     }

//     // This is called by the mediator to receive a button press from the transporter
//     async sendButtonPress(buttonPressed) {
//         switch (buttonPressed) {
//             case 'previous':
//                 this.chartIndex -= 1;
//                 await this.load();
//                 break;
//             case 'play':
//                 this.play()
//                 break;
//             case 'pause':
//                 this.pause();
//                 break;
//             case 'resume':
//                 this.resume();
//                 break;
//             case 'stop':
//                 this.stop();
//                 this.runScript();
//                 break;
//             case 'next':
//                 this.chartIndex += 1;
//                 await this.load();
//                 break;
//         }

//         this.sendTransporterState();
//     }

//     play() {
//         this.currentState = 'playing';

//         this.startTime = window.performance.now() + this.schedulerWindowSize;

//         this.schedulerWorker.postMessage('start');

//         console.debug('Playing!');
//     }

//     pause() {
//         this.currentState = 'paused';

//         this.schedulerWorker.postMessage('stop');

//         this.elapsedTime = window.performance.now() - this.startTime;

//         const twoSchedulerWindowsFromNow = window.performance.now() + (this.schedulerWindowSize * 2);

//         for (const note of this.currentNotes) {
//             this.midiOutput.send([0x80, note, 0x00], twoSchedulerWindowsFromNow);
//         }

//         console.debug('Paused!');
//     }

//     resume() {
//         this.currentState = 'playing';

//         this.startTime = window.performance.now() - this.elapsedTime;

//         for (const note of this.currentNotes) {
//             this.midiOutput.send([0x90, note, 100]);
//         }

//         this.schedulerWorker.postMessage('start');

//         console.debug('Resuming!');
//     }

//     stop() {
//         this.currentState = 'stopped';

//         this.schedulerWorker.postMessage('stop');

//         const twoSchedulerWindowsFromNow = window.performance.now() + (this.schedulerWindowSize * 2);

//         while (this.currentNotes.length) {
//             this.midiOutput.send([0x80, this.currentNotes.pop(), 0x00], twoSchedulerWindowsFromNow);
//         }

//         console.debug('Stopped!');
//     }

//     // Gets the setlist, then loads the first chart
//     async start() {
//         this.midiOutput = await getConnection('synthesizer', 'outputs');

//         this.setlist = await getSetlist();
//         this.numberOfCharts = this.setlist.length;

//         await this.load();

//         this.sendTransporterState();
//     }

//     async load() {
//         this.stop();

//         const chartName = this.setlist[this.chartIndex];
//         const chartPath = `./static/charts/${chartName}.json`
//         const chartText = await getTextFile(chartPath);
//         const chart = JSON.parse(chartText);
//         this.currentChart = chart;
//         const scriptName = chart.scriptName;
//         const scriptPath = `./static/scripts/${scriptName}.js`;
//         this.scriptText = await getTextFile(scriptPath);

//         this.runScript();
//         this.getNextEvent();
//     }

//     getNextEvent() {
//         this.nextEvent = this.eventBuffer.shift();
//         this.nextEventTime = (this.nextEvent.position * this.millisecondsPerBeat) + this.startTime;
//     }

//     runScript() {
//         const controller = this.mediator.controller;
//         controller.clear();

//         const score = this.currentChart.score;

//         this.eventBuffer = eval(this.scriptText)({
//             controller,
//             score,
//             helper
//         });
//     }
// }

export default class Leader {
    constructor(sequencer) {
        this.sequencer = sequencer;

        this.pathToFilesystem = '';

        this.setlist = [];
        this.numberOfCharts = null;
        this.chartIndex = 0;

        this.currentState = 'stopped';
        this.startTime = null;
        this.elapsedTime = 0;
    }

    scheduler() {
        this.sequencer.scheduleParts(window.performance.now());
    }

    play() { }
    pause() { }
    resume() { }
    stop() { }

    async getTextFile(path) {
        const fullPath = `${this.pathToFilesystem}${path}`
        const response = await fetch(fullPath);
        return await response.text();
    }

    async load() {
        this.stop();
        const chartName = this.setlist[this.chartIndex];
        const chartText = await this.getTextFile(`charts/${chartName}.json`);
        const chart = JSON.parse(chartText);

        const partList = chart.partList;
        const score = chart.scorePartwise;

        for (const [id, partListInformation] of partList.entries()) {
            const partName = partListInformation.name;
            const scriptName = partListInformation.script;
            const script = await this.getTextFile(`scripts/${scriptName}.js`);
            this.sequencer.sendLoadToPart(partName, id, script, score);
        }
    }

    async start(pathToFilesystem) {
        this.pathToFilesystem = pathToFilesystem;

        const SetlistLines = await this.getTextFile('setlist.txt');
        const setlist = this.setlist = SetlistLines.split('\n');

        this.numberOfCharts = setlist.length;

        await this.load();
    }
}