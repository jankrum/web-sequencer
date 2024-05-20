Number.prototype.timesDo = function(callback) {
    for (let i = 0; i < this; i += 1) {
        callback(i);
    }
}

export default class Controller {
    constructor(parentDiv, random = true, numberOfModules = 12) {
        this.parentDiv = parentDiv;
        this.allocatedModules = 0;
        this.numberOfModules = numberOfModules;

        (numberOfModules).timesDo(() => {
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
            input.value = random ? Math.floor(Math.random() * 128) : 63;

            label.appendChild(prefixSpan);
            label.appendChild(valueSpan);
            label.appendChild(suffixSpan);
            moduleDiv.appendChild(label);
            moduleDiv.appendChild(input);
            parentDiv.appendChild(moduleDiv);
        });
    }

    clear() {
        this.parentDiv.childNodes.forEach(moduleDiv => {
            const prefixSpan = moduleDiv.querySelector('.prefix-span');
            const valueSpan = moduleDiv.querySelector('.value-span');
            const suffixSpan = moduleDiv.querySelector('.suffix-span');
            const input = moduleDiv.querySelector('input');

            input.oninput = null;

            prefixSpan.innerText = '';
            valueSpan.innerText = '';
            suffixSpan.innerText = '';
        });

        this.allocatedModules = 0;
    }

    getUnallocatedModule() {
        if (this.allocatedModules >= this.numberOfModules) {
            const errorMessage = `Cannot allocate controller module ${this.allocatedModules} >= ${this.numberOfModules}`
            throw new Error(errorMessage);
        }

        const moduleDiv = this.parentDiv.childNodes[this.allocatedModules];
        this.allocatedModules += 1;
        return moduleDiv;
    }

    makeRangeController(prefix, min, max, suffix = '') {
        const moduleDiv = this.getUnallocatedModule();

        const prefixSpan = moduleDiv.querySelector('.prefix-span');
        const valueSpan = moduleDiv.querySelector('.value-span');
        const suffixSpan = moduleDiv.querySelector('.suffix-span');
        const input = moduleDiv.querySelector('input');

        prefixSpan.innerText = prefix;
        suffixSpan.innerText = suffix;

        const slope = (max - min) / 127.0;

        function computeSelectedOption() {
            const initialValue = input.value;
            return min + Math.round(slope * initialValue);
        }

        function updateValueSpan() {
            const index = computeSelectedOption();
            valueSpan.innerText = index;
        }

        input.oninput = updateValueSpan;

        updateValueSpan();

        return {
            get value() {
                return computeSelectedOption();
            }
        }
    }

    makeOptionController(prefix, options, suffix = '') {
        const moduleDiv = this.getUnallocatedModule();

        const prefixSpan = moduleDiv.querySelector('.prefix-span');
        const valueSpan = moduleDiv.querySelector('.value-span');
        const suffixSpan = moduleDiv.querySelector('.suffix-span');
        const input = moduleDiv.querySelector('input');

        prefixSpan.innerText = prefix;
        suffixSpan.innerText = suffix;

        const numberOfOptions = options.length;
        const divisionSize = 128 / numberOfOptions;

        function computeSelectedOption() {
            const initialValue = input.value;
            return Math.floor(initialValue / divisionSize);
        }

        function updateValueSpan() {
            const index = computeSelectedOption();
            valueSpan.innerText = options[index];
        }

        input.oninput = updateValueSpan;

        updateValueSpan();

        return {
            get value() {
                return computeSelectedOption();
            }
        }
    }
}