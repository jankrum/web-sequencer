const unitsAndDurations = {
    "4m": 16,
    "2m": 8,
    "1m": 4,
    "2n": 2,
    "4n": 1,
    "8n": (1 / 2),
    "16n": (1 / 4),
    "32n": (1 / 8),
    "64n": (1 / 16),
    "2t": (4 / 3),
    "4t": (2 / 3),
    "8t": (1 / 3),
    "16t": (1 / 6),
    "32t": (1 / 12),
    "64t": (1 / 24),
    "2n.": 3,
    "4n.": (3 / 2),
    "8n.": (3 / 4),
    "16n.": (3 / 8),
    "32n.": (3 / 16),
    "64n.": (3 / 32)
};

function sumArray(array) {
    return array.reduce((sum, value) => sum + value, 0);
}

function convertSectionToBeats(amount, index) {
    return amount * Math.pow(4, (-1 * index) + 1);
}

function convertColonTimeToBeats(colonTime) {
    const sections = colonTime.split(':');
    const sectionValues = sections.map(convertSectionToBeats);
    return sumArray(sectionValues);
}

function convertUnitAndMagnitudeToBeats([unit, magnitude]) {
    return unitsAndDurations[unit] * magnitude;
}

function convertObjectTimeToPosition(objectTime) {
    const unitsAndMagnitudes = Object.entries(objectTime);
    const positionContributions = unitsAndMagnitudes.map(convertUnitAndMagnitudeToBeats);
    return sumArray(positionContributions);
}

function convertTimeToPosition(time) {
    if (!time) {
        return 0;
    }

    switch (typeof time) {
        case 'number':
            return time;
        case 'string':
            return unitsAndDurations[time] || convertColonTimeToBeats(time);
        case 'object':
            return convertObjectTimeToPosition(time);
        default:
            throw new Error(`Cannot convert time to position: ${time}, type: ${typeof time}`);
    }
}

function insertEventInOrder(eventToInsert, eventBuffer) {
    const indexOfEventAfterEventToInsert = eventBuffer.findIndex(eventInBuffer => eventInBuffer.position > eventToInsert.position);

    // If there is no event after the event to insert, push it to the end
    if (indexOfEventAfterEventToInsert === -1) {
        eventBuffer.push(eventToInsert);
    } else {
        eventBuffer.splice(indexOfEventAfterEventToInsert, 0, eventToInsert);
    }
}

function sortBuffer(eventBuffer) {
    return eventBuffer.toSorted((eventA, eventB) => {
        return eventA.position - eventB.position;
    });
}

function convertPitchNameToMidiNumber(pitchName) {
    const letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const letter = pitchName.slice(0, -1);
    const octave = Number(pitchName.at(-1));

    const pitchNameIndex = letters.indexOf(letter);
    return pitchNameIndex + ((octave + 2) * 12);
}

export default {
    convertTimeToPosition,
    insertEventInOrder,
    sortBuffer,
    convertPitchNameToMidiNumber
};