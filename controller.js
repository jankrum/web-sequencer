import { timesDo, documentMake } from './utility.js';

class ControllerModule {
    constructor(controller) {
        this.controller = controller;

        this.prefixSpan = null;
        this.valueSpan = null;
        this.suffixSpan = null;
        this.input = null;

        this.computeValue = () => input.value;
    }

    clear() {
        this.input.oninput = null;
        this.computeValue = () => this.input.value;

        this.prefixSpan.innerText = '';
        this.valueSpan.innerText = '';
        this.suffixSpan.innerText = '';
    }

    // Returns the value of the controller module
    get value() {
        return this.computeValue();
    }

    // Makes a range control with the given prefix, min, max, and suffix
    makeRangeControl(prefix, min, max, suffix) {
        this.prefixSpan.innerText = prefix;
        this.suffixSpan.innerText = suffix;

        // Can be computed now because it won't change
        const slope = (max - min) / 127.0;

        // We store this for the value getter
        this.computeValue = () => min + Math.round(slope * this.input.value);

        // Updates the value span on input and run it once to set the initial value
        (this.input.oninput = () => this.valueSpan.innerText = this.computeValue())();
    }

    // Makes an option control with the given prefix, options, and suffix
    makeOptionControl(prefix, options, suffix) {
        this.prefixSpan.innerText = prefix;
        this.suffixSpan.innerText = suffix;

        // Can be computed now because it won't change
        const numberOfOptions = options.length;
        const divisionSize = 128 / numberOfOptions;

        // We store this for the value getter
        this.computeValue = () => Math.floor(this.input.value / divisionSize);

        // Updates the value span on input and run it once to set the initial value
        (this.input.oninput = () => this.valueSpan.innerText = options[this.computeValue()])();
    }

    start(controllerDiv) {
        controllerDiv.appendChild(documentMake('div', { className: 'controller-module' }, [
            documentMake('label', {}, [
                this.prefixSpan = documentMake('span', { innerText: '%%' }),
                this.valueSpan = documentMake('span', { innerText: 'EMPTY' }),
                this.suffixSpan = documentMake('span', { innerText: '%%' }),
            ]),
            this.input = documentMake('input', { type: 'range', min: 0, max: 127, value: 63 })
        ]));
    }
}

export default class Controller {
    static numberOfModules = 12;

    constructor(part) {
        this.part = part;
        this.modules = [];
        this.numberOfAllocatedModules = 0;
    }

    clear() {
        this.modules.forEach(module => module.clear());
        this.numberOfAllocatedModules = 0;
    }

    getUnallocatedModule() {
        if (this.numberOfAllocatedModules >= Controller.numberOfModules) {
            const errorMessage = `Out of modules to allocate! Allocated ${this.numberOfAllocatedModules} of ${Controller.numberOfModules} modules.`
            throw new Error(errorMessage);
        }

        const unallocatedModule = this.modules[this.numberOfAllocatedModules];
        this.numberOfAllocatedModules += 1;
        return unallocatedModule;
    }

    getRangeControl(prefix, min, max, suffix = '') {
        const newModule = this.getUnallocatedModule();

        newModule.makeRangeControl(prefix, min, max, suffix);

        return newModule;
    }

    getOptionControl(prefix, options, suffix = '') {
        const newModule = this.getUnallocatedModule();

        newModule.makeOptionControl(prefix, options, suffix);

        return newModule;
    }

    start(controllerSectionDiv, name) {
        const controllerDiv = documentMake('div', { id: `${name}-controller` }, [
            documentMake('h2', { innerText: name.toUpperCase() })
        ]);

        const modules = this.modules = timesDo(Controller.numberOfModules, __ => new ControllerModule(this));
        modules.forEach(module => module.start(controllerDiv));

        controllerSectionDiv.appendChild(controllerDiv);
    }
}