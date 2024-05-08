import getConnection from '/get-connection.js';

const SELECTORS = {
    playButton: '#play-button',
    pauseButton: '#pause-button',
    stopButton: '#stop-button'
};


//--------------------- CODE THAT ACTUALLY IS EXECUTED ------------------------
const output = await getConnection('synthesizer', 'outputs');
output.send([0x90, 60, 100]);
output.send([0x80, 60, 100], window.performance.now() + 1000);
console.log('Done lol');