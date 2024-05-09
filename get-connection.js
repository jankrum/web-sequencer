/**
 * Makes a dialog without needing any information
 * @returns {Object} Elements in the dialog
 */
function makeDialog() {
    // Create the actual elements
    const dialog = document.createElement('dialog');
    const form = document.createElement('form');
    const labelSelectDiv = document.createElement('div');
    const labelForSelect = document.createElement('label');
    const select = document.createElement('select');
    const buttonDiv = document.createElement('div');
    const cancelButton = document.createElement('button');
    const submitButton = document.createElement('button');
    const labelForCheckbox = document.createElement('label');
    const rememberCheckbox = document.createElement('input');

    // Add attributes to the elements
    labelForSelect.htmlFor = 'select';
    select.id = 'select';
    cancelButton.textContent = 'Cancel';
    submitButton.textContent = 'Select';
    labelForCheckbox.textContent = 'Remember this device:';
    labelForCheckbox.htmlFor = 'remember';
    rememberCheckbox.id = 'remember';
    rememberCheckbox.type = 'checkbox';

    // Make the form not submit
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    // Structure the elements
    labelSelectDiv.appendChild(labelForSelect);
    labelSelectDiv.appendChild(select);
    buttonDiv.appendChild(cancelButton);
    buttonDiv.appendChild(submitButton);
    buttonDiv.appendChild(labelForCheckbox);
    buttonDiv.appendChild(rememberCheckbox);
    form.appendChild(labelSelectDiv);
    form.appendChild(buttonDiv);
    dialog.appendChild(form);
    document.body.appendChild(dialog);

    // Return the elements we will use later
    return {
        dialog,
        form,
        labelForSelect,
        select,
        cancelButton,
        submitButton,
        rememberCheckbox
    };
}

/**
 * Makes the cancel button close the dialog and reject the promise.
 * @param {Object} dialogElements 
 * @param {Function} reject 
 */
function makeCancelButtonWork({ dialog, cancelButton }, reject) {
    cancelButton.addEventListener('mousedown', () => {
        dialog.close();
        reject(new Error('User cancelled'));
    });
}

/**
 * Makes the submit button close the dialog and resolve the promise.
 * @param {Object} dialogElements 
 * @param {string} relationshipName 
 * @param {Function} getPortByName 
 * @param {Function} resolve
 */
function makeSubmitButtonWork({ submitButton, select, rememberCheckbox, dialog }, relationshipName, getPortByName, resolve) {
    submitButton.addEventListener('mousedown', () => {
        const selectedPortName = select.value;
        const port = getPortByName(selectedPortName);

        // This should hopefully never happen
        if (!port) {
            alert('Port not found');
            return;
        }

        if (rememberCheckbox.checked) {
            localStorage.setItem(relationshipName, selectedPortName);
        }

        dialog.close();
        document.body.removeChild(dialog);

        resolve(port);
    });
}

/**
 * Opens a dialog that lets the user choose a port.
 * @param {Array<MIDIPort>} portArray 
 * @param {string} relationshipName 
 * @param {Function} getPortByName 
 * @returns {Promise<MIDIPort>} The port the user chose
 */
function askUserToChoosePort(portArray, relationshipName, getPortByName) {
    // Create the dialog
    const dialogElements = makeDialog();

    // Set the label text
    dialogElements.labelForSelect.textContent = `Choose a device for the "${relationshipName}" connection:`;
    
    // Add options to the select element
    portArray.forEach(port => {
        const option = document.createElement('option');
        option.innerText = port.name;
        dialogElements.select.appendChild(option);
    });

    return new Promise(async (resolve, reject) => {
        makeCancelButtonWork(dialogElements, reject);
        makeSubmitButtonWork(dialogElements, relationshipName, getPortByName, resolve);

        dialogElements.dialog.showModal();
    });
}

/**
 * Checks local storage for a port name associated with a relationship.
 * - If it finds one, it tries to connect to that port.
 * - If it can't, it opens a dialog to let the user choose a port.
 * @param {MIDIAccess} midiAccessObj 
 * @param {string} name 
 * @param {string} direction 
 * @returns {Promise<MIDIPort>}
 */
async function getConnectionFromMidiAccessObj(midiAccessObj, relationshipName, direction) {
    // Used to get all of the inputs/outputs and also to get a port by name
    const midiMap = midiAccessObj[direction];
    const portArray = Array.from(midiMap.values());

    if (portArray.length === 0) {
        throw new Error(`No ${direction} found`);
    }

    /**
     * Gets a port from the portArray by its name.
     * @param {string} portName 
     * @returns {MIDIPort|null}
     */
    function getPortByName(portName) {
        return portArray.find(port => port.name === portName) || null;
    }

    // Check if the port is in local storage
    const portNameInStorage = localStorage.getItem(relationshipName) || null;

    // If the port is in local storage, try to connect to it
    if (portNameInStorage) {
        const portFoundFromStorage = getPortByName(portNameInStorage);

        if (portFoundFromStorage) {
            return portFoundFromStorage;
        }
    }

    // If the port is not in local storage, ask the user to choose a port
    const port = await askUserToChoosePort(portArray, relationshipName, getPortByName);

    return port;
}


//-----------------------------------------------------------------------------
//------------------------------ WHAT WE RETURN -------------------------------
//-----------------------------------------------------------------------------

// This is used to make a closure that makes a partial. FUCK YOU :P
const midiAccess = await navigator.requestMIDIAccess({ sysex: true });
export default async function (relationshipName, direction) {
    return getConnectionFromMidiAccessObj(midiAccess, relationshipName, direction);
}