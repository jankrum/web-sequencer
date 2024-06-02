// The goal of this script is to write a export an async function that gets information from the user.
// First, we will create a dialog that will contain a form.
// The form will contain a label, a select element, and a submit button.
// The dialog will also contain a cancel button.
// The dialog will be appended to the body and displayed.
// When the form is submitted, getSettings will return the information from the form.
// I won't do any styling here, that will be handled in a separate file.
// There will be a class for the dialog and form, which we will use to hold objects related to specific parts of the band.

function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

class SynthOptions {
    constructor(name) {
        const div = this.div = document.createElement('div');
        const hasSynthCheckbox = this.hasSynthCheckbox = document.createElement('input');
        const label = this.label = document.createElement('label');
        const select = this.select = document.createElement('select');
        const optionA = document.createElement('option');
        const optionB = document.createElement('option');
        const optionC = document.createElement('option');
        const optionD = document.createElement('option');
        const channelLabel = this.channelLabel = document.createElement('label');
        const channelInput = this.channelInput = document.createElement('input');

        hasSynthCheckbox.type = 'checkbox';
        hasSynthCheckbox.name = `has-${name}-synth`;
        hasSynthCheckbox.id = `has-${name}-synth`;
        hasSynthCheckbox.checked = true;
        label.innerHTML = 'Synthesizer:&nbsp;';
        label.htmlFor = select.id;
        select.name = `${name}-synth-select`;
        select.id = `${name}-synth-select`;
        optionA.value = 'a';
        optionA.textContent = 'Option A';
        optionB.value = 'b';
        optionB.textContent = 'Option B';
        optionC.value = 'c';
        optionC.textContent = 'Option C';
        optionD.value = 'd';
        optionD.textContent = 'Option D';
        channelLabel.innerHTML = 'Channel:&nbsp;';
        channelLabel.htmlFor = `${name}-synth-channel-input`;
        channelInput.type = 'number';
        channelInput.name = `${name}-synth-channel-input`;
        channelInput.id = `${name}-synth-channel-input`;
        channelInput.min = 1;
        channelInput.max = 16;
        channelInput.value = 1;

        hasSynthCheckbox.addEventListener('change', () => {
            if (hasSynthCheckbox.checked) {
                select.disabled = false;
                channelInput.disabled = false;
            } else {
                select.disabled = true;
                channelInput.disabled = true;
            }
        });

        select.append(optionA, optionB, optionC, optionD);
        div.append(hasSynthCheckbox, label, select, channelLabel, channelInput);
    }

    get value() {
        const hasSynth = this.hasSynthCheckbox.checked;

        if (hasSynth) {
            const synth = this.select.value;
            const channel = this.channelInput.value;

            return { synth, channel };
        } else {
            return { synth: null, channel: null };
        }
    }
}

class ControllerTypes {
    constructor(name) {
        this.radioButtons = [];

        const div = this.div = document.createElement('div');
        const header = document.createElement('h4');

        div.classList.add('controller-types');
        header.textContent = 'Controller Type:';

        div.appendChild(header);

        const types = [
            { name: 'hidden', label: 'Hidden' },
            { name: 'on-page', label: 'On page' },
            { name: 'midi', label: 'MIDI' },
            { name: 'websocket', label: 'Websocket' }
        ];

        types.forEach(type => {
            const label = document.createElement('label');
            const radioButton = document.createElement('input');

            radioButton.type = 'radio';
            radioButton.name = `${name}-controller-type`;
            radioButton.id = `${type.name}-${name}-controller-type`;
            radioButton.value = type.name;

            this.radioButtons.push(radioButton);

            label.append(radioButton, type.label);
            div.appendChild(label);
        });

        this.radioButtons[0].checked = true;
    }
}

class ControllerSpecifics {
    constructor() {
        const div = this.div = document.createElement('div');
        const hiddenDiv = this.hiddenDiv = document.createElement('div');
        const onPageDiv = this.onPageDiv = document.createElement('div');
        const midiDiv = this.midiDiv = document.createElement('div');
        const websocketDiv = this.websocketDiv = document.createElement('div');

        const hiddenHeader = document.createElement('h4');
        const onPageHeader = document.createElement('h4');
        const midiHeader = document.createElement('h4');
        const websocketHeader = document.createElement('h4');

        hiddenHeader.textContent = 'Hidden';
        onPageHeader.textContent = 'On page';
        midiHeader.textContent = 'MIDI';
        websocketHeader.textContent = 'Websocket';
        hiddenDiv.classList.add('hidden-specifics');
        onPageDiv.classList.add('on-page-specifics');
        midiDiv.classList.add('midi-specifics');
        websocketDiv.classList.add('websocket-specifics');

        hiddenDiv.style.display = 'block';
        onPageDiv.style.display = 'none';
        midiDiv.style.display = 'none';
        websocketDiv.style.display = 'none';

        hiddenDiv.appendChild(hiddenHeader);
        onPageDiv.appendChild(onPageHeader);
        midiDiv.appendChild(midiHeader);
        websocketDiv.appendChild(websocketHeader);
        div.append(hiddenDiv, onPageDiv, midiDiv, websocketDiv);
    }
}

class ControllerOptions {
    constructor(name) {
        const div = this.div = document.createElement('div');
        const typesDiv = new ControllerTypes(name);
        const controllerSpecifics = this.specificsDiv = new ControllerSpecifics();

        div.classList.add('controller-options');

        typesDiv.radioButtons.forEach(radioButton => {
            const value = radioButton.value;
            const specificDiv = controllerSpecifics.div.querySelector(`.${value}-specifics`);
            radioButton.addEventListener('change', () => {
                if (radioButton.checked) {
                    controllerSpecifics.div.querySelectorAll('div').forEach(genericDiv => {
                        genericDiv.style.display = 'none';
                    });
                    specificDiv.style.display = 'block';
                }
            });
        });

        div.append(typesDiv.div, controllerSpecifics.div);
    }

    get value() {
        return {
            controller: {
                setMeUpBitch: () => {
                    console.log('FUCK YOU');
                }
            }
        };
    }
}

class PartOptions {
    constructor(name) {
        this.name = name;

        const div = this.div = document.createElement('div');
        const header = document.createElement('h2');
        const synthOptions = this.synthOptions = new SynthOptions(name);
        const hr = document.createElement('hr');
        const controllerOptions = this.controllerOptions = new ControllerOptions(name);

        div.id = `${name}-part-options`;
        header.textContent = capitalizeFirstLetter(name);

        div.append(header, synthOptions.div, hr, controllerOptions.div);
    }

    get value() {
        return {
            ...this.synthOptions.value,
            ...this.controllerOptions.value
        };
    }
}

class ButtonDiv {
    constructor() {
        const div = this.div = document.createElement('div');
        const rememberCheckbox = this.rememberCheckbox = document.createElement('input');
        const labelForCheckbox = document.createElement('label');
        const cancelButton = this.cancelButton = document.createElement('button');
        const refreshButton = this.refreshButton = document.createElement('button');
        const submitButton = this.submitButton = document.createElement('button');

        rememberCheckbox.type = 'checkbox';
        rememberCheckbox.name = 'remember-checkbox';
        rememberCheckbox.id = 'remember-checkbox';
        labelForCheckbox.textContent = 'Don\'t ask again';
        labelForCheckbox.htmlFor = 'remember-checkbox';
        cancelButton.textContent = 'Cancel';
        refreshButton.textContent = 'Refresh';
        submitButton.textContent = 'Submit';

        div.append(rememberCheckbox, labelForCheckbox, cancelButton, refreshButton, submitButton);
    }
}

class SettingsDialog {
    constructor() {
        const dialog = this.dialog = document.createElement('dialog');
        const form = document.createElement('form');
        const allPartsDiv = document.createElement('div');
        const buttonDiv = this.buttonDiv = new ButtonDiv();

        const allPartNames = ['bass', 'drum', 'chord', 'lead'];
        const allParts = this.allParts = allPartNames.map(partName => new PartOptions(partName));

        // form.action = '';
        allPartsDiv.id = 'all-parts-options';

        form.addEventListener('submit', (event) => {
            event.preventDefault();
        });

        allParts.forEach(part => {
            allPartsDiv.appendChild(part.div);
        });

        form.append(allPartsDiv, buttonDiv.div);
        dialog.appendChild(form);
        document.body.appendChild(dialog);
    }

    get value() {
        const parts = Object.fromEntries(this.allParts.map(part => [part.name, part.value]));

        return { parts };
    }

    makePromise() {
        return new Promise((resolve, reject) => {
            this.buttonDiv.cancelButton.addEventListener('click', () => {
                this.dialog.close('canceled');
                reject('canceled');
            });

            this.buttonDiv.submitButton.addEventListener('click', () => {
                this.dialog.close('submitted');
                const settings = this.value;

                if (this.buttonDiv.rememberCheckbox) {
                    localStorage.setItem('settings', JSON.stringify(settings));
                }

                resolve(settings);
            });

            this.dialog.showModal();
        });

    }
}

export default async function getSettings() {
    // const storedSettings = localStorage.getItem('settings');

    // if (storedSettings) {
    //     const settings = JSON.parse(storedSettings);
    //     return settings;
    // }

    const dialog = new SettingsDialog();
    return dialog.makePromise();
}