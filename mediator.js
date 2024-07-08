export default class {
    constructor() {
        this.sequencer = null;
        this.transporter = null;
        this.controllers = null;
    }

    /**
     * Mediate button presses from the transporter to the sequencer
     * @param {string} buttonPressed - The button that was pressed
     */
    sendButtonPressToSequencer(buttonPressed) {
        this.sequencer.receiveButtonPress(buttonPressed);
    }

    /**
     * Mediate command changes from the controller to the sequencer
     * @param {string} part - The part to send the command change to
     * @param {number} commandChange - The command change to send
     * @param {number} value - The value of the command change
     */
    sendCommandChangeToSequencer(part, commandChange, value) {
        this.sequencer.receiveCommandChange(part, commandChange, value);
    }

    /**
     * Mediate state changes from the sequencer to the transporter
     * @param {object} state - The state to send to the transporter
     */
    sendStateToTransporter(state) {
        this.transporter.receiveState(state);
    }

    /**
     * Mediate range control configuration from the sequencer to the controller
     * @param {string} controllerToSendTo - The name of the controller to send the range control to
     * @param {string} prefix - The prefix for the label
     * @param {number} min - The minimum value of the range
     * @param {number} max - The maximum value of the range
     * @param {string} suffix - The suffix for the label
     */
    sendRangeControlToController(controllerToSendTo, prefix, min, max, suffix) {
        this.controllers[controllerToSendTo].receiveRangeControl(prefix, min, max, suffix);
    }

    /**
     * Mediate options control configuration from the sequencer to the controller
     * @param {string} controllerToSendTo - The name of the controller to send the options control to
     * @param {string} prefix - The prefix for the label
     * @param {string[]} options - The options
     * @param {string} suffix - The suffix for the label
     */
    sendOptionControlToController(controllerToSendTo, prefix, options, suffix) {
        this.controllers[controllerToSendTo].receiveOptionControl(prefix, options, suffix);
    }

    /**
     * Assign the sequencer, transporter, and controllers to mediate
     * @param {object} sequencer - The sequencer to mediate
     * @param {object} transporter - The transporter to mediate
     * @param {object} controllers - The controllers to mediate
     */
    assign(sequencer, transporter, controllers) {
        this.sequencer = sequencer;
        this.transporter = transporter;
        this.controllers = controllers;
    }
}