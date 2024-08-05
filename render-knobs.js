// https://g200kg.github.io/input-knobs/

import { dm, timesDo } from "./utility.js";

const bodyStyle = getComputedStyle(document.body);
const tickColor = bodyStyle.backgroundColor;
const knobColor = bodyStyle.color;
const knobSize = 64; // If you change this, you must also change the CSS
const halfSize = knobSize / 2;
const tickStartPosition = 7;
const tickEndPosition = halfSize - 4;
const sensitivity = 500;
const sprites = 126;
const frameCount = sprites + 1;
const rangeMin = 0;
const rangeMax = 127;
const rangeStep = 1;

const knobFrames = (() => {
    const svgNamespace = 'http://www.w3.org/2000/svg';

    const circleAttributes = {
        cx: halfSize,
        cy: halfSize,
        r: halfSize - 2,
        fill: knobColor
    };

    const lineAttributes = {
        x1: halfSize,
        y1: tickEndPosition,
        x2: halfSize,
        y2: tickStartPosition,
        "stroke-linecap": "round",
        "stroke-width": "6",
        stroke: tickColor
    }

    const circle = dm(`${svgNamespace}>circle`, circleAttributes);
    const line = dm(`${svgNamespace}>line`, lineAttributes);
    const g = dm(`${svgNamespace}>g`, { id: "K" }, circle, line);
    const defs = dm(`${svgNamespace}>defs`, {}, g);

    const uses = timesDo(frameCount, (i) => {
        const use = dm(`${svgNamespace}>use`, {
            "xlink:href": "#K",
            transform: `translate(0,${knobSize * i}) rotate(${-135 + 270 * i / frameCount},32,32)`
        });
        return use;
    });

    const svgAttributes = {
        xmlns: 'http://www.w3.org/2000/svg',
        'http://www.w3.org/2000/xmlns/>xmlns:xlink': 'http://www.w3.org/1999/xlink',
        width: `${knobSize}`,
        height: `${frameCount * knobSize}`,
        viewBox: `0 0 ${knobSize} ${frameCount * knobSize}`,
        preserveAspectRatio: 'none'
    };

    const svg = dm(`${svgNamespace}>svg`, svgAttributes, defs, ...uses);

    return svg.outerHTML;
})();


export default () => {
    function initializeRange(inputRange) {
        let lastValue = inputRange.value;
        // let dragFrom = { x: event.clientX, y: event.clientY, a: Math.atan2(event.clientX - cx, cy - event.clientY), v: +inputRange.value };

        function redraw() {
            let v = inputRange.value / rangeMax;
            inputRange.style.backgroundPosition = "0px " + (-((v * sprites) | 0) * knobSize) + "px";
            lastValue = inputRange.value;
        }

        function checkThenRedraw() {
            if (lastValue != inputRange.value) {
                redraw();
            }
        }

        let ir = inputRange.inputKnobs = {};

        function setRangeValue(v) {
            v = (Math.round((v - rangeMin) / rangeStep)) * rangeStep + rangeMin;
            if (v < rangeMin) v = rangeMin;
            if (v > rangeMax) v = rangeMax;
            inputRange.value = v;
            if (inputRange.value !== lastValue) {
                inputRange.setAttribute("value", inputRange.value);
                redraw();
                let event = document.createEvent("HTMLEvents");
                event.initEvent("input", false, true);
                inputRange.dispatchEvent(event);
                lastValue = inputRange.value;
            }
        }

        function dealWithPointerDown(event) {
            inputRange.focus();
            const evorg = event;
            if (event.touches)
                event = event.touches[0];

            ir.dragfrom = { x: event.clientX, y: event.clientY, v: +inputRange.value };

            document.addEventListener("mousemove", dealWithPointerMove);
            document.addEventListener("touchmove", dealWithPointerMove);
            document.addEventListener("mouseup", dealWithPointerUp);
            document.addEventListener("touchend", dealWithPointerUp);
            document.addEventListener("touchcancel", dealWithPointerUp);
            evorg.preventDefault();
            evorg.stopPropagation();
        }

        function dealWithPointerMove(event) {
            let dv;
            if (event.touches)
                event = event.touches[0];
            let dx = event.clientX - ir.dragfrom.x
            let dy = event.clientY - ir.dragfrom.y;

            dv = (dx / sensitivity - dy / sensitivity) * rangeMax;

            setRangeValue(ir.dragfrom.v + dv);
        }

        function dealWithPointerUp() {
            document.removeEventListener("mousemove", dealWithPointerMove);
            document.removeEventListener("touchmove", dealWithPointerMove);
            document.removeEventListener("mouseup", dealWithPointerUp);
            document.removeEventListener("touchend", dealWithPointerUp);
            document.removeEventListener("touchcancel", dealWithPointerUp);
            let event = document.createEvent("HTMLEvents");
            event.initEvent("change", false, true);
            inputRange.dispatchEvent(event);
        }

        // Making it appear
        let svg = knobFrames;
        inputRange.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svg) + ")";
        inputRange.style.backgroundSize = `100% ${(sprites + 1) * 100}%`;

        inputRange.addEventListener("keydown", checkThenRedraw);
        inputRange.addEventListener("mousedown", dealWithPointerDown);
        inputRange.addEventListener("touchstart", dealWithPointerDown);

        redraw();
    }

    // Initialize all knobs
    const allRanges = document.querySelectorAll("input.input-knob");
    for (let range of Array.from(allRanges)) {
        initializeRange(range);
    }
};