import { Debouncer, timesDo, documentMake } from './utility.js';

class ControllerModule {
    static commandAddressStart = 102;  // The starting cc address for the controller
    static numberOfTicksInInput = 128;  // Number of ticks in the input range
    static debounceTimeout = 100;  // Number of milliseconds to debounce the knob turn

    constructor(controller, index) {
        this.controller = controller;

        this.debouncer = null;
        this.commandAddress = index + ControllerModule.commandAddressStart;
        this.computeValue = () => 'EMPTY';

        this.prefixSpan = null;
        this.valueSpan = null;
        this.suffixSpan = null;
        this.knobInput = null;
    }

    /**
     * Clears the module and resets the compute value and value spans
     */
    clear() {
        this.computeValue = () => '';

        this.prefixSpan.innerText = '';
        this.valueSpan.innerText = '';
        this.suffixSpan.innerText = '';
    }

    /**
     * Sets the prefix and suffix of the label, sets the computed value field, and updates the value span
     * @param {string} prefix - The static prefix of the label
     * @param {number} min - The inclusive minimum value of the range
     * @param {number} max - The inclusive maximum value of the range
     * @param {string} suffix - The static suffix of the label
     */
    makeRangeControl(prefix, min, max, suffix) {
        this.prefixSpan.innerText = prefix;
        this.suffixSpan.innerText = suffix;

        // Can be computed now because it won't change
        const slope = (max - min) / (ControllerModule.numberOfTicksInInput - 1.0);

        // We store this for the value getter
        this.computeValue = () => min + Math.round(slope * this.input.value);

        // Updates the value span on input and run it once to set the initial value
        this.knobInput.oninput();
    }

    /**
     * Sets the prefix and suffix of the label, sets the computed value field, and updates the value span
     * @param {*} prefix - The static prefix of the label
     * @param {*} options - The options to choose from
     * @param {*} suffix - The static suffix of the label
     */
    makeOptionControl(prefix, options, suffix) {
        this.prefixSpan.innerText = prefix;
        this.suffixSpan.innerText = suffix;

        // Can be computed now because it won't change
        const numberOfOptions = options.length;
        const divisionSize = ControllerModule.numberOfTicksInInput / numberOfOptions;

        // We store this for the value getter
        this.computeValue = () => Math.floor(this.input.value / divisionSize);

        // Updates the value span on input and run it once to set the initial value
        this.knobInput.oninput();
    }

    /**
     * Creates the controller module and appends it to the controller div
     * @param {HTMLDivElement} controllerDiv - The div to put the controller module in
     */
    start(controllerDiv) {
        // Makes the knob input
        const max = ControllerModule.numberOfTicksInInput - 1;
        const value = Math.floor(max / 2);
        const knobInput = this.knobInput = documentMake('input', { type: 'range', min: 0, max, value });

        // Debounce the input
        const debouncer = this.debouncer = new Debouncer(ControllerModule.debounceTimeout, () => {
            this.valueSpan.innerText = this.computeValue();
            this.controller.sendCommandChangeToSequencer(this.commandAddress, Number(knobInput.value));
        });
        const dealWithKnobInput = knobInput.oninput = () => {
            debouncer.debounce();
        };

        // Append the controller module to the controller div
        controllerDiv.appendChild(documentMake('div', { className: 'controller-module' }, [
            documentMake('label', {}, [
                this.prefixSpan = documentMake('span', { innerText: '%%' }),
                this.valueSpan = documentMake('span', { innerText: 'EMPTY' }),
                this.suffixSpan = documentMake('span', { innerText: '%%' }),
            ]),
            knobInput
        ]));

        // Run the input handler once to set the initial value
        dealWithKnobInput();
    }
}

export default class Controller {
    static numberOfModules = 12;  // Number of modules in the controller

    constructor(mediator, partName) {
        this.mediator = mediator;
        this.partName = partName;
        this.modules = timesDo(Controller.numberOfModules, (_, index) => new ControllerModule(this, index));
        this.numberOfAllocatedModules = 0;
    }

    /**
     * Forwards a cc message from a controller module and sends it to the sequencer through the mediator
     * @param {number} commandChange - The command change to send
     * @param {number} value - The value of the command change
    */
    sendCommandChangeToSequencer(commandChange, value) {
        this.mediator.sendCommandChangeToSequencer(this.partName, commandChange, value);
    }

    /**
     * Clears all the modules and resets the number of allocated modules
     */
    clear() {
        this.modules.forEach(module => module.clear());
        this.numberOfAllocatedModules = 0;
    }

    /**
     * Gets the next unallocated module, or throws an error if there are no more modules to allocate
     * @returns {ControllerModule} - The next unallocated module
     */
    getUnallocatedModule() {
        if (this.numberOfAllocatedModules >= Controller.numberOfModules) {
            const errorMessage = `Out of modules to allocate! Allocated ${this.numberOfAllocatedModules} of ${Controller.numberOfModules} modules.`
            throw new Error(errorMessage);
        }

        const unallocatedModule = this.modules[this.numberOfAllocatedModules];
        this.numberOfAllocatedModules += 1;
        return unallocatedModule;
    }

    /**
     * Gets a range control with the given prefix, min, max, and suffix and returns the module
     * For use in the script for the part
     * @param {string} prefix - The static prefix of the label
     * @param {number} min - The inclusive minimum value of the range
     * @param {number} max - The inclusive maximum value of the range
     * @param {string} suffix - The optional static suffix of the label
     */
    receiveRangeControlConfig(prefix, min, max, suffix) {
        const newControlModule = this.getUnallocatedModule();
        newControlModule.makeRangeControl(prefix, min, max, suffix);
    }

    /**
     * Gets an option control with the given prefix, options, and suffix and returns the module
     * For use in the script for the part
     * @param {string} prefix - The static prefix of the label
     * @param {string[]} options - The options to choose from
     * @param {string} suffix - The optional static suffix of the label
     */
    receiveOptionControlConfig(prefix, options, suffix) {
        const newControlModule = this.getUnallocatedModule();
        newControlModule.makeOptionControl(prefix, options, suffix);
    }

    /**
     * Makes the controller and appends it to the controller section div
     * @param {HTMLDivElement} controllerSectionDiv - The div to put the controller in
     * @param {string} name - The name of the controller
     */
    start(controllerSectionDiv) {
        const name = this.partName;

        const checkbox = documentMake('input', { type: 'checkbox', id: `${name}-checkbox`, checked: true });

        checkbox.addEventListener('change', () => {
            const modules = controllerDiv.querySelectorAll('.controller-module');
            for (const module of modules) {
                module.style.display = checkbox.checked ? 'flex' : 'none';
            }
        });

        const controllerDiv = documentMake('div', { id: `${name}-controller` }, [
            documentMake('div', { style: 'width: 100%; display: flex; flex-direction: row; justify-content: space-between;' }, [
                documentMake('h2', { innerText: name.toUpperCase() }),
                checkbox
            ])
        ]);

        this.modules.forEach(module => module.start(controllerDiv));

        controllerSectionDiv.appendChild(controllerDiv);
    }
}