({ controller, score, helper }) => {
    const octaveJumpChanceControl = controller.getRangeControl('8va chance: ', 0, 100, '%');

    function makeOctaveJumpNote(basePitch) {
        const roll = Math.random() * 100;

        const chance = octaveJumpChanceControl.value;

        console.debug(`Roll: ${roll}, chance: ${chance}`);

        return helper.convertPitchNameToMidiNumber(basePitch) + (roll > chance ? 0 : 12);
    }

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
                const callback = eventBuffer => {
                    const computedPitch = makeOctaveJumpNote(scoreEvent.pitch);
                    helper.insertEventInOrder({
                        type: 'noteOn',
                        position,
                        pitch: computedPitch,
                    }, eventBuffer);

                    const noteOffPosition = helper.convertTimeToPosition(scoreEvent.duration) + position - 0.1;
                    helper.insertEventInOrder({
                        type: 'noteOff',
                        position: noteOffPosition,
                        pitch: computedPitch,
                    }, eventBuffer);
                };
                return {
                    type: 'computed',
                    position,
                    callback
                }
            case 'stop':
                return {
                    type: 'stop',
                    position
                }
            default:
                throw new Error(`Unknown event type: ${type}`);
        }
    }

    return score.map(transformEvent);
}