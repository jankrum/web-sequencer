export function convertPositionToBeat([measure = 0, quarter = 0, sixteenth = 0]) {
    return (measure * 4) + quarter + (sixteenth * 0.25);
}

export function insertEventInOrder(eventToInsert, eventBuffer) {
    const indexOfEventAfterEventToInsert = eventBuffer.findIndex(eventAlreadyInBuffer => convertPositionToBeat(eventAlreadyInBuffer[1]) > convertPositionToBeat(eventToInsert[1]));

    // If there is no event after the event to insert, push it to the end
    if (indexOfEventAfterEventToInsert === -1) {
        eventBuffer.push(eventToInsert);
    } else {
        eventBuffer.splice(indexOfEventAfterEventToInsert, 0, eventToInsert);
    }
}

export function convertPitchNameToMidiNumber(pitchName) {
    const letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const letter = pitchName.slice(0, -1);
    const octave = Number(pitchName.at(-1));

    const pitchNameIndex = letters.indexOf(letter);
    return pitchNameIndex + ((octave + 2) * 12);
}