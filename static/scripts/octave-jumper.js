({ controller, score, helper }) => {
    const octaveJumpChanceControl = controller.configure('8va chance: ', '%');

    function makeOctaveJumpNote(basePitch) {
        const roll = Math.random() * 100;

        const chance = octaveJumpChanceControl.value;

        console.log(`Roll: ${roll}, chance: ${chance}`);

        return basePitch + (roll > chance ? 0 : 12);
    }

    function transform(scoreEvent) {
        const { type, time } = scoreEvent;

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
                    const computedPitch = makeOctaveJumpNote(pitch);
                    helper.insertEventInOrder({
                        type: 'noteOn',
                        position,
                        pitch: computedPitch,
                    }, eventBuffer);

                    const noteOffPosition = helper.convertTimeToPosition(scoreEvent.duration) + position;
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

        }
    }

    return helper.sortBuffer(score.map(transform).flat());
}
