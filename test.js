import renderKnobs from './render-knobs.js';

await (new Promise(resolve => setTimeout(resolve, 1000)));

await renderKnobs();

console.log('Knobs rendered');