({ controller, score, helper }) => {
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

    // const result = [
    //     ...chart.score,
    //     [
    //         {
    //             type: 'computed',
    //             callback: eventBuffer => {
    //                 const shouldRepeat = repeatControl.value;

    //                 if (shouldRepeat) {
    //                     console.log(`Next measure number: ${nextMeasureNumber}`);

    //                     function writeNewMeasure(eventAndTime) {
    //                         const [event, time] = eventAndTime;
    //                         return [event, [nextMeasureNumber, ...time.slice(1)]]
    //                     }

    //                     const eventsWithoutTempo = result.slice(1);
    //                     const nextMeasure = eventsWithoutTempo.map(writeNewMeasure);

    //                     eventBuffer.push(...nextMeasure);
    //                 } else {
    //                     eventBuffer.push([{
    //                         type: 'stop'
    //                     }, [nextMeasureNumber]]);
    //                 }

    //                 nextMeasureNumber += 1;
    //             }
    //         },
    //         [
    //             0, 3, 3
    //         ]
    //     ]
    // ];

    // function transformEvent(scoreEvent) {
    //     const type = scoreEvent.type;
    //     const time = scoreEvent.time;

    //     const position = helper.convertTimeToPosition(time);

    //     if (type === 'tempo') {
    //         return {
    //             type: 'tempo',
    //             position,
    //             bpm: scoreEvent.bpm,
    //         }
    //     }

    //     if (type === 'note') {
    // const computedPitch = makeOctaveJumpNote(scoreEvent.pitch);
    // const duration = scoreEvent.duration;
    // const noteOffPosition = helper.convertTimeToPosition(duration) + position - 0.1;
    // return [
    //     {
    //         type: 'noteOn',
    //         position,
    //         pitch: computedPitch,
    //     },
    //     {
    //         type: 'noteOff',
    //         position: noteOffPosition,
    //         pitch: computedPitch,
    //     }
    // ];
    //     }

    //     throw new Error(`Unknown event type: ${type}`);
    // }

    const repeatControl = controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!');

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

    console.log('Result: ', result);
    return result;
};