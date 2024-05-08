/**
 * Checks local storage for a port name associated with a relationship.
 * @param {string} relationshipName 
 * @returns {string | null} The port name associated with the relationship
 */
function checkLocalStorageForPortNameAssociatedWithRelationship(relationshipName) {
    const portName = localStorage.getItem(relationshipName);
    return portName || null;
}

/**
 * Saves a port name associated with a relationship in local storage.
 * @param {string} relationshipName 
 * @param {string} portName 
 */
function savePortNameAssociatedWithRelationship(relationshipName, portName) {
    localStorage.setItem(relationshipName, portName);
}

/**
 * Creates a dialog that lets the user choose a port.
 * @param {Array<MIDIPort>} portArray 
 * @param {string} relationshipName
 * @returns {Object} An object containing the dialog and its elements
 */
function makeDialog(portArray, relationshipName) {
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
    labelForSelect.textContent = `Choose a device for the "${relationshipName}" connection:`;
    cancelButton.textContent = 'Cancel';
    submitButton.textContent = 'Select';
    labelForCheckbox.textContent = 'Remember this device:';
    rememberCheckbox.type = 'checkbox';

    // Add ports to select
    function addPortNameToSelect(port) {
        const option = document.createElement('option');
        option.innerText = port.name;
        select.appendChild(option);
    }

    portArray.forEach(addPortNameToSelect);

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

        if (!port) {
            alert('Port not found');
            return;
        }

        if (rememberCheckbox.checked) {
            savePortNameAssociatedWithRelationship(relationshipName, selectedPortName);
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
    const dialogElements = makeDialog(portArray, relationshipName);

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
async function getConnectionFromMidiAccessObj(midiAccessObj, name, direction) {
    const midiMap = midiAccessObj[direction];
    const portArray = Array.from(midiMap.values());

    function getPortByName(portName) {
        return portArray.find(port => port.name === portName) || null;
    }

    const portNameInStorage = checkLocalStorageForPortNameAssociatedWithRelationship(name);

    if (portNameInStorage) {
        const portFoundFromStorage = getPortByName(portNameInStorage);
        if (portFoundFromStorage) {
            return portFoundFromStorage;
        }
    }

    const port = await askUserToChoosePort(portArray, name, getPortByName);

    return port;
}


//-----------------------------------------------------------------------------
//------------------------------ WHAT WE RETURN -------------------------------
//-----------------------------------------------------------------------------

// This is used to create a closure that will be used to make a partial FUCK U
const midiAccess = await navigator.requestMIDIAccess({ sysex: true });
export default async function(name, direction) {
    return getConnectionFromMidiAccessObj(midiAccess, name, direction);
}