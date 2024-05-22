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

const base32String = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const states = ['playing', 'paused', 'stopped'];

const previousBitPosition = 3;
const nextBitPosition = 2;
const stateBitPosition = 0;

export function dumbStateToString(canPrevious, canNext, transporterState, title) {
    const canPreviousBit = canPrevious ? 1 << previousBitPosition : 0;
    const canNextBit = canNext ? 1 << nextBitPosition : 0;
    const stateBits = states.indexOf(transporterState) << stateBitPosition;
    const stateChar = base32String[stateBits + canPreviousBit + canNextBit];
    return stateChar + title;
}

export function dumbStringToState(dumbString) {
    const stateChar = dumbString.charAt(0);
    const stateIndex = base32String.indexOf(stateChar) & (0b11 << stateBitPosition) >> stateBitPosition;
    const canPrevious = Boolean(base32String.indexOf(stateChar) & (1 << previousBitPosition));
    const canNext = Boolean(base32String.indexOf(stateChar) & (1 << nextBitPosition));
    const state = states[stateIndex];

    const title = dumbString.slice(1);
    return { canPrevious, canNext, state, title };
}

export async function getSetlist() {
    const setlistLines = await fetch('./static/setlist.txt').then(response => response.text());
    return setlistLines.split('\n');
}