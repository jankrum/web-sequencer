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

    const moduleDiv = dm('div', { class: 'controller-module' }, label, inputRange);

    return moduleDiv;
}

function makeController(part) {
    const title = part.toUpperCase();

    const controllerModules = timesDo(modulesPerController, makeControllerModule);
    const id = `${part.toLowerCase()}-controller`;

    const titleHeader = dm('h3', {}, title);

    const controllerRowDiv = dm('div', { class: 'controller-row' }, ...controllerModules);

    const controllerDiv = dm('div', { class: 'controller', id }, titleHeader, controllerRowDiv);

    titleHeader.addEventListener('mousedown', () => {
        controllerRowDiv.hidden = !controllerRowDiv.hidden;
    });

    return controllerDiv;
}

function makeControllerSection() {
    const controllers = parts.map(makeController);

    const controllerSectionDiv = dm('div', { id: 'controller-section' }, ...controllers);

    return controllerSectionDiv;
}

function makeTransporter() {
    const title = dm('h2', {}, '%%EMPTY%%')

    const buttonTexts = [
        '⏮', //&#x23EE
        '⏵', //&#x23F5
        '⏸', //&#x23F8
        '⏹', //&#x23F9
        '⏭'//&#x23ED
    ];

    const buttons = buttonTexts.map(buttonText => dm('button', {}, buttonText));

    const transporterDiv = dm('div', { id: 'transporter' }, title, ...buttons);

    return transporterDiv;
}

addEventListener('load', () => {
    const body = document.querySelector('body');

    const controllerSection = makeControllerSection();
    const transporter = makeTransporter();

    body.append(controllerSection);
    body.append(transporter);

    renderKnobs();
});