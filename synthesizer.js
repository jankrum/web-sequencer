export default class Synthesizer {
    constructor(part) {
        this.part = part;
        this.output = null;
        this.channel = 0;
        this.currentNotes = [];
    }

    play(pitch, velocity, time) {
        this.currentNotes.push(pitch);
        this.output.send([0x90 + this.channel, pitch, velocity], time);
    }

    stop(pitch, time) {
        this.currentNotes.splice(this.currentNotes.indexOf(pitch), 1);
        this.output.send([0x80 + this.channel, pitch, 0], time);
    }

    async start(midiAccess, name) {
        function getNewOutputsArray() {
            return Array.from(midiAccess.outputs.values());
        }

        const outputs = getNewOutputsArray();
        if (outputs.length === 0) {
            throw new Error('No MIDI outputs found');
        }

        const synthPromptText = `Select the synthesizer for the ${name}`;
        const options = outputs.map((output, index) => `[${index + 1}] ${output.name}`);
        const optionsText = options.join('\n');

        while (true) {
            const input = prompt(`${synthPromptText}\n${optionsText}`);
            if (input === null) {
                throw new Error('User cancelled');
            }
            const index = Number(input) - 1;
            const output = outputs[index];
            if (output) {
                this.output = output;
                break;
            }
        }

        // Set the channel to the index of the output
        const channelPromptText = `Select the channel for the synthesizer [1-16]`;

        while (true) {
            const input = prompt(channelPromptText);
            if (input === null) {
                throw new Error('User cancelled');
            }
            const channel = Number(input);
            if (channel >= 1 && channel <= 16) {
                this.channel = channel - 1;
                break;
            }
        }

    }
}