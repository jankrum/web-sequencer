/**
 * Performs the given callback the number of times specified by the number
 * @param {Function} callback - The callback to call for each iteration
 * @returns An array of the return values of the callback
 */
Number.prototype.timesDo = function (callback) {
    return Array.from({ length: this }, (_, i) => callback(i));
}

// Represents a controller module in the controller
class ControllerModule {
    // Creates the controller module and appends it to the parent div
    constructor(parentDiv) {
        const moduleDiv = document.createElement('div');
        const label = document.createElement('label');
        const prefixSpan = document.createElement('span');
        const valueSpan = document.createElement('span');
        const suffixSpan = document.createElement('span');
        const input = document.createElement('input');

        moduleDiv.classList.add('control-module');
        prefixSpan.innerText = '%%';
        prefixSpan.classList.add('prefix-span');
        valueSpan.classList.add('value-span');
        valueSpan.innerText = 'EMPTY';
        suffixSpan.classList.add('suffix-span');
        suffixSpan.innerText = '%%';
        input.type = 'range';
        input.min = 0;
        input.max = 127;
        input.value = 63;

        this.prefixSpan = prefixSpan;
        this.valueSpan = valueSpan;
        this.suffixSpan = suffixSpan;
        this.input = input;

        label.appendChild(prefixSpan);
        label.appendChild(valueSpan);
        label.appendChild(suffixSpan);
        moduleDiv.appendChild(label);
        moduleDiv.appendChild(input);
        parentDiv.appendChild(moduleDiv);

        this.computeValue = () => input.value;
    }

    // Returns the value of the controller module
    get value() {
        return this.computeValue();
    }

    // Clears the controller module
    clear() {
        this.input.oninput = null;

        this.prefixSpan.innerText = '';
        this.valueSpan.innerText = '';
        this.suffixSpan.innerText = '';
    }

    // Makes a range control with the given prefix, min, max, and suffix
    makeRangeControl(prefix, min, max, suffix) {
        this.prefixSpan.innerText = prefix;
        this.suffixSpan.innerText = suffix;

        // Can be computed now because it won't change
        const slope = (max - min) / 127.0;

        // We store this for the value getter
        this.computeValue = () => min + Math.round(slope * this.input.value);

        // Updates the value span
        function updateValueSpan() {
            this.valueSpan.innerText = this.computeValue();
        }

        this.input.oninput = updateValueSpan;

        // Call it once to set the initial value
        updateValueSpan();
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

        // Updates the value span
        function updateValueSpan() {
            this.valueSpan.innerText = options[this.computeValue()];
        }

        this.input.oninput = updateValueSpan;

        // Call it once to set the initial value
        updateValueSpan();
    }
}

export default class Controller {
    constructor(parentDiv, numberOfModules = 12) {
        this.numberOfModules = numberOfModules;
        this.controllerModules = (numberOfModules).timesDo(() => new ControllerModule(parentDiv));
        this.allocatedModules = 0;
    }

    // This is called by the mediator to set the mediator
    assignMediator(mediator) {
        this.mediator = mediator;
        mediator.setController(this);
    }

    // Clears all the controller modules
    clear() {
        this.controllerModules.forEach(module => module.clear());
        this.allocatedModules = 0;
    }

    // Randomizes all the controller modules
    randomize() {
        this.controllerModules.forEach(module => {
            const input = module.input;
            input.value = Math.floor(Math.random() * 128);
            input.oninput();
        });
    }

    // Gets an unallocated controller module
    getUnallocatedModule() {
        if (this.allocatedModules >= this.numberOfModules) {
            const errorMessage = `Cannot allocate controller module ${this.allocatedModules} >= ${this.numberOfModules}`
            throw new Error(errorMessage);
        }

        const moduleDiv = this.controllerModules[this.allocatedModules];
        this.allocatedModules += 1;
        return moduleDiv;
    }

    // Makes a range control with the given prefix, min, max, and suffix
    makeRangeControl(prefix, min, max, suffix = '') {
        const newModule = this.getUnallocatedModule();

        newModule.makeRangeControl(prefix, min, max, suffix);

        return newModule;
    }

    // Makes an option control with the given prefix, options, and suffix
    makeOptionControl(prefix, options, suffix = '') {
        const newModule = this.getUnallocatedModule();

        newModule.makeOptionControl(prefix, options, suffix);

        return newModule;
    }
}