({ controller, score, helper }) => {
    const repeatControl = controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!');

    const notesOnly = scoreEvent => scoreEvent.type === 'note';

    const makeSimpler = scoreEvent => {
        const midiPitch = helper.convertPitchNameToMidiNumber(scoreEvent.pitch);
        const position = helper.convertTimeToPosition(scoreEvent.time);
        const duration = scoreEvent.duration;
        const noteOffPosition = helper.convertTimeToPosition(duration) + position - 0.1;
        return [
            {
                type: 'noteOn',
                position,
                pitch: midiPitch,
            },
            {
                type: 'noteOff',
                position: noteOffPosition,
                pitch: midiPitch,
            }
        ];
    }

    const firstMeasureNoteOnsAndOffs = score.filter(notesOnly).map(makeSimpler).flat()

    const maybeMakeRun = (position) => {
        // Its a two beat run
        const nextRunStartPosition = position + 2;

        return (eventBuffer) => {
            const shouldRepeat = repeatControl.value;

            if (shouldRepeat) {
                const nextRun = firstMeasureNoteOnsAndOffs.map(event => {
                    return {
                        ...event,
                        position: event.position + position
                    }
                });

                eventBuffer.push(...nextRun);
                eventBuffer.push({
                    type: 'computed',
                    position: nextRunStartPosition - 0.1,
                    callback: maybeMakeRun(nextRunStartPosition)
                })


            } else {
                eventBuffer.push({
                    type: 'stop',
                    position: nextRunStartPosition
                });
            }
        }
    }

    const result = [
        {
            'type': 'computed',
            'position': -1,
            'callback': maybeMakeRun(0)
        },
        {
            'type': 'tempo',
            'position': 0,
            'bpm': 165
        }
    ];

    return result;
};