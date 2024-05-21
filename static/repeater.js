(chart, controller) => {
    const repeatControl = controller.makeOptionController('Repeat again: ', ['No', 'Yes'], '!');
    
    let nextMeasureNumber = 1;

    const result = [
        ...chart.score,
        [
            {
                type: 'computed',
                callback: eventBuffer => {
                    const shouldRepeat = repeatControl.value;
    
                    if (shouldRepeat) {
                        // console.log('Yea we are repeating!');
                        console.log(`Next measure number: ${nextMeasureNumber}`);
    
                        function writeNewMeasure(eventAndTime) {
                            const [event, time] = eventAndTime;
                            return [event, [nextMeasureNumber, ...time.slice(1)]]
                        }
    
                        const eventsWithoutTempo = result.slice(1);
                        const nextMeasure = eventsWithoutTempo.map(writeNewMeasure);
    
                        eventBuffer.push(...nextMeasure);
                    } else {
                        console.log('We are not repeating!');
                        // console.log(`Next measure number: ${nextMeasureNumber}`);
    
                        eventBuffer.push([{
                            type: 'stop'
                        }, [nextMeasureNumber]]);
                    }
    
                    nextMeasureNumber += 1;
                }
            },
            [
                0, 3, 3
            ]
        ]
    ];

    return result;
};