export default class Synthesizer {
    constructor(part) {
        this.part = part;
        this.output = null;
        this.channel = 0;
        this.currentNotes = [];
    }

    /**
     * Schedule a note to be played at a certain time and keep track of it
     * @param {Number} pitch - The pitch to play
     * @param {Number} velocity - The velocity to play the note
     * @param {Number} time - The time to play the note in milliseconds
     */
    play(pitch, velocity, time) {
        this.currentNotes.push(pitch);
        this.output.send([0x90 + this.channel, pitch, velocity], time);
    }

    /**
     * Stop playing a note at a certain time and remove it from the list of current notes
     * @param {Number} pitch - The pitch to stop playing
     * @param {*} time - The time to stop playing the note in milliseconds
     */
    stop(pitch, time) {
        this.currentNotes.splice(this.currentNotes.indexOf(pitch), 1);
        this.output.send([0x80 + this.channel, pitch, 0], time);
    }

    /**
     * Sets up the synthesizer by prompting the user to select the output and channel
     * @param {MIDIAccess} midiAccess - The MIDI access to use
     * @param {String} name - The name of the part
     */
    async start(midiAccess, name) {
        while (true) {
            const outputs = Array.from(midiAccess.outputs.values());

            if (outputs.length === 0) {
                throw new Error('No MIDI outputs found');
            }

            const synthPromptText = `Select the synthesizer for the ${name}`;
            const options = outputs.map((output, index) => `[${index + 1}] ${output.name}`);
            const optionsText = options.join('\n');
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
        const channelPromptText = `Select the MIDI channel for ${name} [1-16]`;

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