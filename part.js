import { doTimes, documentMake } from "./utility.js";

export default class Part {
    constructor(sequencer, name) {
        this.sequencer = sequencer;
        this.name = name;
    }

    async start(controllerDiv) {
        const name = this.name;

        // Make the elements and append them to the parent div
        controllerDiv.append(
            documentMake('div', { id: `${name}-controller` }, doTimes(12, index =>
                documentMake('div', { id: `${name}-module-${index}`, className: 'controller-module' }, [
                    documentMake('label', {}, [
                        documentMake('span', { innerText: '%%' }),
                        documentMake('span', { innerText: 'EMPTY' }),
                        documentMake('span', { innerText: '%%' }),
                    ]),
                    documentMake('input', { type: 'range', min: 0, max: 127, value: 63 })
                ])
            ))
        );
    }
}