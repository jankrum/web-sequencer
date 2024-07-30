// https://g200kg.github.io/input-knobs/

import { dm, timesDo } from "./utility.js";

const bodyStyle = getComputedStyle(document.body);
const tickColor = bodyStyle.backgroundColor;
const knobColor = bodyStyle.color;
const knobSize = 64; // If you change this, you must also change the CSS
const sensitivity = 500;
const sprites = 100;
const frameCount = sprites + 1;

const knobFrames = (() => {
    const svgNamespace = 'http://www.w3.org/2000/svg';

    const circle = dm(`${svgNamespace}>circle`, {
        cx: "32",
        cy: "32",
        r: "30",
        fill: knobColor
    });

    const line = dm(`${svgNamespace}>line`, {
        x1: "32",
        y1: "28",
        x2: "32",
        y2: "7",
        "stroke-linecap": "round",
        "stroke-width": "6",
        stroke: tickColor
    });

    const g = dm(`${svgNamespace}>g`, { id: "K" }, circle, line);

    const defs = dm(`${svgNamespace}>defs`, {}, g);

    const uses = timesDo(frameCount, (i) => {
        const use = dm(`${svgNamespace}>use`, {
            "xlink:href": "#K",
            transform: `translate(0,${knobSize * i}) rotate(${-135 + 270 * i / frameCount},32,32)`
        });
        return use;
    });

    const svg = dm(`${svgNamespace}>svg`, {
        xmlns: 'http://www.w3.org/2000/svg',
        'http://www.w3.org/2000/xmlns/>xmlns:xlink': 'http://www.w3.org/1999/xlink',
        width: `${knobSize}`,
        height: `${frameCount * knobSize}`,
        viewBox: `0 0 ${knobSize} ${frameCount * knobSize}`,
        preserveAspectRatio: 'none'
    }, defs, ...uses);

    return svg.outerHTML;
})();


export default () => {
    function initializeRange(inputRange) {
        function redraw() {
            let v = (inputRange.value - ir.valrange.min) / (ir.valrange.max - ir.valrange.min);
            inputRange.style.backgroundPosition = "0px " + (-((v * sprites) | 0) * knobSize) + "px";
            ir.valueold = inputRange.value;
        }

        function checkThenRedraw() {
            if (ir.valueold != inputRange.value) {
                redraw();
            }
        }

        let width, height;

        let ir = inputRange.inputKnobs = {};

        inputRange.setValue = (v) => {
            v = (Math.round((v - ir.valrange.min) / ir.valrange.step)) * ir.valrange.step + ir.valrange.min;
            if (v < ir.valrange.min) v = ir.valrange.min;
            if (v > ir.valrange.max) v = ir.valrange.max;
            inputRange.value = v;
            if (inputRange.value !== ir.oldvalue) {
                inputRange.setAttribute("value", inputRange.value);
                checkThenRedraw();
                let event = document.createEvent("HTMLEvents");
                event.initEvent("input", false, true);
                inputRange.dispatchEvent(event);
                ir.oldvalue = inputRange.value;
            }
        };

        ir.pointerdown = (ev) => {
            inputRange.focus();
            const evorg = ev;
            if (ev.touches)
                ev = ev.touches[0];
            let rc = inputRange.getBoundingClientRect();
            let cx = (rc.left + rc.right) * 0.5, cy = (rc.top + rc.bottom) * 0.5;

            ir.dragfrom = { x: ev.clientX, y: ev.clientY, a: Math.atan2(ev.clientX - cx, cy - ev.clientY), v: +inputRange.value };
            document.addEventListener("mousemove", ir.pointermove);
            document.addEventListener("mouseup", ir.pointerup);
            document.addEventListener("touchmove", ir.pointermove);
            document.addEventListener("touchend", ir.pointerup);
            document.addEventListener("touchcancel", ir.pointerup);
            evorg.preventDefault();
            evorg.stopPropagation();
        };

        ir.pointermove = (ev) => {
            let dv;
            if (ev.touches)
                ev = ev.touches[0];
            let dx = ev.clientX - ir.dragfrom.x, dy = ev.clientY - ir.dragfrom.y;

            dv = (dx / sensitivity - dy / sensitivity) * (ir.valrange.max - ir.valrange.min);
            if (ev.shiftKey)
                dv *= 0.2;
            inputRange.setValue(ir.dragfrom.v + dv);
        };

        ir.pointerup = () => {
            document.removeEventListener("mousemove", ir.pointermove);
            document.removeEventListener("touchmove", ir.pointermove);
            document.removeEventListener("mouseup", ir.pointerup);
            document.removeEventListener("touchend", ir.pointerup);
            document.removeEventListener("touchcancel", ir.pointerup);
            let event = document.createEvent("HTMLEvents");
            event.initEvent("change", false, true);
            inputRange.dispatchEvent(event);
        };

        ir.keydown = () => {
            checkThenRedraw();
        };

        // Making it appear
        let svg = knobFrames;
        ir.sprites = 100;
        inputRange.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svg) + ")";
        inputRange.style.backgroundSize = `100% ${(sprites + 1) * 100}%`;
        ir.valrange = { min: +inputRange.min, max: (inputRange.max == "") ? 100 : +inputRange.max, step: (inputRange.step == "") ? 1 : +inputRange.step };
        redraw();

        inputRange.addEventListener("keydown", ir.keydown);
        inputRange.addEventListener("mousedown", ir.pointerdown);
        inputRange.addEventListener("touchstart", ir.pointerdown);
    }

    // Initialize all knobs
    for (let range of Array.from(document.querySelectorAll("input.input-knob,input.input-slider"))) {
        initializeRange(range);
    }

    // console.log(makeKnobFrames(101, 'red', 'blue'));
};