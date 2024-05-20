export function convertPitchNameToMidiNumber(pitchName) {
    const letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const letter = pitchName.slice(0, -1);
    const octave = Number(pitchName.at(-1));

    const pitchNameIndex = letters.indexOf(letter);
    return pitchNameIndex + ((octave + 2) * 12);
}