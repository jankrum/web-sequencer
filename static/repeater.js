const repeatControl = controller.makeOptionController('Repeat again: ', ['No', 'Yes'], '!');


function transformer(chart) {
    // All the notes in the first measure
    const firstMeasure = chart.score.slice(1);

    function computeRepeatOrEnd(eventBuffer) {
        const shouldRepeat = repeatControl.value;
        
        if (shouldRepeat) {
            firstMeasure.forEach(note => {
                eventBuffer.push([{
                    type: 'note',
                    pitch: note[0].pitch,
                    duration: note[1]
                }, note[1]])
            });
        } else {
            eventBuffer.push([{
                type: 'stop'
            }, [1]])
        }
    }

    const result = [
        ...chart.score,
        [
            {
                type: 'computed',
                value: computeRepeatOrEnd
            },
            [
                0, 3, 3
            ]
        ]
    ];
}

transformer;