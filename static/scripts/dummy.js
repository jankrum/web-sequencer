({ score, helper }) => {

    function transformEvent(scoreEvent) {
        const type = scoreEvent.type;
        const time = scoreEvent.time;

        const position = helper.convertTimeToPosition(time);

        switch (type) {
            case 'tempo':
                return {
                    type: 'tempo',
                    position,
                    bpm: scoreEvent.bpm,
                }
            case 'note':
                const midiNumber = helper.convertPitchNameToMidiNumber(scoreEvent.pitch);
                const noteOnEvent = {
                    type: 'noteOn',
                    position,
                    pitch: midiNumber,
                };

                const durationNumber = helper.convertTimeToPosition(scoreEvent.duration)
                const noteOffPosition = Math.max((durationNumber * 0.9), (durationNumber - 0.1)) + position;
                const noteOffEvent = {
                    type: 'noteOff',
                    position: noteOffPosition,
                    pitch: midiNumber,
                };

                return [noteOnEvent, noteOffEvent];
            case 'stop':
                return {
                    type: 'stop',
                    position
                }
            default:
                throw new Error(`Unknown event type: ${type}`);
        }
    }

    const rawBuffer = score.map(transformEvent);
    const flattenedBuffer = rawBuffer.flat();
    const sortedBuffer = helper.sortBuffer(flattenedBuffer);
    return sortedBuffer;
}