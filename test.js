import { dm, timesDo } from './utility.js';
import renderKnobs from './render-knobs.js';

const parts = ['Bass', 'Drums', 'Chord', 'Lead'];
const modulesPerController = 4;
const rangeMin = 0;
const rangeMax = 127;
const rangeStep = 1;
const rangeValue = 64;

function makeControllerModule(index) {
    const prefixSpan = dm('span', {}, '%%');
    const valueSpan = dm('span', {}, 'EMPTY');
    const suffixSpan = dm('span', {}, '%%');

    const label = dm('label', {}, prefixSpan, valueSpan, suffixSpan);

    const inputRange = dm('input', { type: 'range', name: 'knob', class: 'input-knob', min: rangeMin, max: rangeMax, value: rangeValue, step: rangeStep });

    let updateValue = () => {
        valueSpan.textContent = inputRange.value;
    }

    inputRange.addEventListener('input', updateValue);

    updateValue();

    // const svgNamespace = 'http://www.w3.org/2000/svg';
    // const svg = document.createElementNS(svgNamespace, 'svg');
    // svg.setAttribute('viewBox', `0 0 64 ${101 * 64}`);
    // svg.setAttribute('preserveAspectRatio', 'none');
    // const g = document.createElementNS(svgNamespace, 'g');

    const moduleDiv = dm('div', { class: 'controller-module' }, label, inputRange);

    return moduleDiv;
}

function makeController(part) {
    const title = part.toUpperCase();
    const controllerModules = timesDo(modulesPerController, makeControllerModule);
    const id = `${part.toLowerCase()}-controller`;

    const titleHeader = dm('h3', {}, title);

    const controllerDiv = dm('div', { class: 'controller', id }, titleHeader, ...controllerModules);

    return controllerDiv;
}

function makeControllerSection() {
    const controllers = parts.map(makeController);

    const controllerSectionDiv = dm('div', { id: 'controller-section' }, ...controllers);

    return controllerSectionDiv;
}

function makeTransporter() {
    const transporterDiv = dm('div', { id: 'transporter' });

    return transporterDiv;
}

addEventListener('load', () => {
    const body = document.querySelector('body');

    const controllerSection = makeControllerSection();
    // const transporter = makeTransporter();

    body.append(controllerSection);
    // body.append(transporter);

    renderKnobs();
});

// const svgNamespace = 'http://www.w3.org/2000/svg';
// const svg = document.createElementNS(svgNamespace, 'svg');
// svg.setAttribute('viewBox', '0 0 100 100');
// const path = document.createElementNS(svgNamespace, 'path');
// path.setAttribute('d', 'M 50 0 L 60 10 L 60 90 L 50 100 L 40 90 L 40 10 Z');
// svg.append(path);
// document.body.append(svg);