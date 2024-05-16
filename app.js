import getConnection from './get-connection.js';  // Used to get midi connections
import Timeline from './timeline.js';  // Used to control playback

// Get the output to the synthesizer
const synthesizerOutput = await getConnection('synthesizer', 'outputs');

const timeline = new Timeline(
    document.querySelector('#play-button'),
    document.querySelector('#pause-button'),
    document.querySelector('#resume-button'),
    document.querySelector('#stop-button'),
    synthesizerOutput
);

async function load() {    
    const chart = await (async () => {
        const rawChart = await fetch('./static/twinkle-twinkle-little-star.json').then(response => response.json());
        
        function convertPitchNameToMidiNumber(pitchName) {
            const letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            
            const letter = pitchName.slice(0, -1);
            const octave = Number(pitchName.at(-1));
            
            const pitchNameIndex = letters.indexOf(letter);
            return pitchNameIndex + ((octave + 2) * 12);
        }
        
        return {
            tempo: Number(rawChart.tempo),
            notes: rawChart.notes.map(note => ({
                pitch: convertPitchNameToMidiNumber(note.pitch),
                start: Number(note.start),
                duration: Number(note.duration)
            }))
        };
    })();
    
    const script = await fetch('./static/octave-jumper.js').then(response => response.text());
    
    const controller = (() => {
        const prefixSpan = document.querySelector('span#prefix');
        const valueSpan = document.querySelector('span#value');
        const suffixSpan = document.querySelector('span#suffix');
        
        const input = document.querySelector('input');
        
        return {
            configure: (prefix, suffix) => {
                prefixSpan.textContent = prefix;
                suffixSpan.textContent = suffix;
                
                function updateValue() {
                    valueSpan.textContent = input.value;
                }
                
                input.addEventListener('input', updateValue);
                
                updateValue();
                
                return input
            }
        };
    })();
    
    const newChart = eval(script)(chart);
    console.log(newChart.notes[0].pitch());
    
    timeline.setTempo(newChart.tempo);
    
    for (const note of newChart.notes) {
        timeline.addNoteToChart(note.pitch, note.start, note.duration);
    }
}

await load();
    
console.log('%cReady!', 'background-color: green; color: white;');