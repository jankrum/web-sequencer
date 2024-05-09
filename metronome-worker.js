let timerId = null;
let intervalInMilliseconds = 100;

function start() {
	timerId = setInterval(() => {
		postMessage("tick");
	}, intervalInMilliseconds);
}

function setIntervalRate(newInterval) {
	intervalInMilliseconds = newInterval;
	if (timerId) {
		clearInterval(timerId);
		start();
	}
}

function stop() {
	clearInterval(timerId);
	timerId = null;
}

self.addEventListener('message', e => {
	switch(e.data) {
		case "start":
			start();
			break;
		case "stop":
			stop();
			break;
		default:
			if (e?.data?.interval) {
				setIntervalRate(e.data.interval);
			}
			break;
	}
});

postMessage('ready');