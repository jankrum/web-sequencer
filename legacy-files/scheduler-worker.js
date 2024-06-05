let intervalHandle;
const tickRate = 25;

self.onmessage = (e) => {
	if (e.data === 'start') {
		if (intervalHandle) {
			clearInterval(intervalHandle);
		}
		intervalHandle = setInterval(() => postMessage('tick'), tickRate);
	} else if (e.data === 'stop') {
		clearInterval(intervalHandle);
	}
}