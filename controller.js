/**
 * Generates an array of the given length and runs the callback for each element
 * @param {Number} numberOfTimes - The number of times to run the callback
 * @param {Function} callback - The callback to run
 * @returns {Array} - An array of the results of the callback
 */
function timesDo(numberOfTimes, callback) {
    return Array.from({ length: numberOfTimes }, (_, i) => callback(i));
}

// Represents a controller module in the controller
class ControllerModule {
    // Create the values that are referenced between methods
    constructor() {
        this.prefixSpan = null;
        this.valueSpan = null;
        this.suffixSpan = null;
        this.input = null;

        this.computeValue = () => input.value;
    }

    // Called by the controller to set up the controller module's elements
    start(parentDiv) {
        // Create the elements
        const moduleDiv = document.createElement('div');
        const label = document.createElement('label');
        const prefixSpan = document.createElement('span');
        const valueSpan = document.createElement('span');
        const suffixSpan = document.createElement('span');
        const input = document.createElement('input');

        // Store the elements for later
        this.prefixSpan = prefixSpan;
        this.valueSpan = valueSpan;
        this.suffixSpan = suffixSpan;
        this.input = input;

        // Set the classes and attributes of the elements
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

        // Add the elements to the parent div
        label.appendChild(prefixSpan);
        label.appendChild(valueSpan);
        label.appendChild(suffixSpan);
        moduleDiv.appendChild(label);
        moduleDiv.appendChild(input);
        parentDiv.appendChild(moduleDiv);
    }

    // Returns the value of the controller module
    get value() {
        return this.computeValue();
    }

    // Clears the controller module
    clear() {
        this.input.oninput = null;
        this.computeValue = () => this.input.value;

        this.prefixSpan.innerText = '';
        this.valueSpan.innerText = '';
        this.suffixSpan.innerText = '';
    }

    randomize() {
        this.input.value = Math.floor(Math.random() * 128);
        this.input.oninput();
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
    // Create the values that are referenced between methods
    constructor() {
        this.mediator = null;
        this.numberOfModules = 0;
        this.controllerModules = [];
        this.allocatedModules = 0;
    }

    // Called by app.js to set up the controller's controller modules
    start(parentDiv, numberOfModules) {
        this.numberOfModules = numberOfModules;

        // Add a controller module to the parent div
        function addControllerModuleToParentDiv() {
            const newControllerModule = new ControllerModule();
            newControllerModule.start(parentDiv);
            return newControllerModule;
        }

        // Create the controller modules
        this.controllerModules = timesDo(numberOfModules, addControllerModuleToParentDiv);
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
            module.randomize();
        });
    }

    // Gets an unallocated controller module
    getUnallocatedModule() {
        if (this.allocatedModules >= this.numberOfModules) {
            const errorMessage = `Out of modules to allocate! Allocated ${this.allocatedModules} of ${this.numberOfModules} modules.`
            throw new Error(errorMessage);
        }

        const unallocatedModule = this.controllerModules[this.allocatedModules];
        this.allocatedModules += 1;
        return unallocatedModule;
    }

    // Makes a range control with the given prefix, min, max, and suffix
    getRangeControl(prefix, min, max, suffix = '') {
        const newModule = this.getUnallocatedModule();

        newModule.makeRangeControl(prefix, min, max, suffix);

        return newModule;
    }

    // Makes an option control with the given prefix, options, and suffix
    getOptionControl(prefix, options, suffix = '') {
        const newModule = this.getUnallocatedModule();

        newModule.makeOptionControl(prefix, options, suffix);

        return newModule;
    }
}