const octaveJumpChanceControl = controller.configure('8va chance: ', '%');

function makeOctaveJumpNote(basePitch) {
    const roll = Math.random() * 100;
    return () => {
        const chance = octaveJumpChanceControl.value;

        console.log(`Roll: ${roll}, chance: ${chance}`);

        return basePitch + (roll > chance ? 0 : 12);
    }
}

function transformer(chart) {
    const {tempo, notes} = chart;
    const newNotes = notes.map(note => {
        const {pitch, start, duration} = note;
        const newPitch = makeOctaveJumpNote(pitch);
        return { pitch: newPitch, start, duration};
    });
    return {tempo, notes: newNotes};
}

transformer;