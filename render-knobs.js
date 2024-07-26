// https://g200kg.github.io/input-knobs/

import { sleep } from "./utility.js";

export default async () => {
    let options = window.inputKnobsOptions || {};
    options.knobWidth = 64;
    options.knobHeight = 64;
    const firstModule = document.querySelector('div.controller-module');
    const firstModuleStyle = getComputedStyle(firstModule);
    options.tickColor = firstModuleStyle.backgroundColor;
    options.knobColor = firstModuleStyle.color;
    options.knobMode = "linear";
    let styles = document.createElement("style");
    styles.innerHTML =
        `input[type=range].input-knob,input[type=range].input-slider{
  -webkit-appearance:none;
  -moz-appearance:none;
  border:none;
  box-sizing:border-box;
  overflow:hidden;
  background-repeat:no-repeat;
  background-size:100% 100%;
  background-position:0px 0%;
  background-color:transparent;
  touch-action:none;
}
input[type=range].input-knob{
  width:${options.knobWidth}px; height:${options.knobHeight}px;
}
input[type=range].input-knob::-webkit-slider-thumb,input[type=range].input-slider::-webkit-slider-thumb{
  -webkit-appearance:none;
  opacity:0;
}
input[type=range].input-knob::-moz-range-thumb,input[type=range].input-slider::-moz-range-thumb{
  -moz-appearance:none;
  height:0;
  border:none;
}
input[type=range].input-knob::-moz-range-track,input[type=range].input-slider::-moz-range-track{
  -moz-appearance:none;
  height:0;
  border:none;
}`;
    document.head.appendChild(styles);

    function makeKnobFrames(frameCount, foregroundColor, backgroundColor) {
        let r =
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="${frameCount * 64}" viewBox="0 0 64 ${frameCount * 64}" preserveAspectRatio="none">
<defs><g id="K"><circle cx="32" cy="32" r="30" fill="${backgroundColor}"/>
<line x1="32" y1="28" x2="32" y2="7" stroke-linecap="round" stroke-width="6" stroke="${foregroundColor}"/></g></defs>
<use xlink:href="#K" transform="rotate(-135,32,32)"/>`;
        for (let i = 1; i < frameCount; ++i) {
            r += `<use xlink:href="#K" transform="translate(0,${64 * i}) rotate(${-135 + 270 * i / frameCount},32,32)"/>`;
        }
        return r + "</svg>";
    }

    function initializeKnob(knobToInitialize) {
        let width, height, diameter, foregroundColor, backgroundColor;

        // If the knob has already been initialized, redraw it and return
        if (knobToInitialize.inputKnobs) {
            knobToInitialize.redraw();
            return;
        }

        let ik = knobToInitialize.inputKnobs = {};
        knobToInitialize.refresh = () => {
            diameter = +knobToInitialize.getAttribute("data-diameter");
            let st = document.defaultView.getComputedStyle(knobToInitialize, null);
            width = parseFloat(knobToInitialize.getAttribute("data-width") || diameter || st.width);
            height = parseFloat(knobToInitialize.getAttribute("data-height") || diameter || st.height);
            backgroundColor = knobToInitialize.getAttribute("data-knobColor") || options.knobColor;
            foregroundColor = knobToInitialize.getAttribute("data-tickColor") || options.tickColor;
            ik.sensex = ik.sensey = 200;
            ik.itype = "k";
            knobToInitialize.style.width = width + "px";
            knobToInitialize.style.height = height + "px";
            ik.frameheight = height;
            let svg = makeKnobFrames(101, foregroundColor, backgroundColor);
            ik.sprites = 100;
            knobToInitialize.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svg) + ")";
            knobToInitialize.style.backgroundSize = `100% ${(ik.sprites + 1) * 100}%`;
            ik.valrange = { min: +knobToInitialize.min, max: (knobToInitialize.max == "") ? 100 : +knobToInitialize.max, step: (knobToInitialize.step == "") ? 1 : +knobToInitialize.step };
            knobToInitialize.redraw(true);
        };
        knobToInitialize.setValue = (v) => {
            v = (Math.round((v - ik.valrange.min) / ik.valrange.step)) * ik.valrange.step + ik.valrange.min;
            if (v < ik.valrange.min) v = ik.valrange.min;
            if (v > ik.valrange.max) v = ik.valrange.max;
            knobToInitialize.value = v;
            if (knobToInitialize.value != ik.oldvalue) {
                knobToInitialize.setAttribute("value", knobToInitialize.value);
                knobToInitialize.redraw();
                let event = document.createEvent("HTMLEvents");
                event.initEvent("input", false, true);
                knobToInitialize.dispatchEvent(event);
                ik.oldvalue = knobToInitialize.value;
            }
        };
        ik.pointerdown = (ev) => {
            knobToInitialize.focus();
            const evorg = ev;
            if (ev.touches)
                ev = ev.touches[0];
            let rc = knobToInitialize.getBoundingClientRect();
            let cx = (rc.left + rc.right) * 0.5, cy = (rc.top + rc.bottom) * 0.5;
            let da = Math.atan2(ev.clientX - cx, cy - ev.clientY);
            if (ik.itype == "k" && options.knobMode == "circularabs") {
                dv = ik.valrange.min + (da / Math.PI * 0.75 + 0.5) * (ik.valrange.max - ik.valrange.min);
                knobToInitialize.setValue(dv);
            }
            ik.dragfrom = { x: ev.clientX, y: ev.clientY, a: Math.atan2(ev.clientX - cx, cy - ev.clientY), v: +knobToInitialize.value };
            document.addEventListener("mousemove", ik.pointermove);
            document.addEventListener("mouseup", ik.pointerup);
            document.addEventListener("touchmove", ik.pointermove);
            document.addEventListener("touchend", ik.pointerup);
            document.addEventListener("touchcancel", ik.pointerup);
            evorg.preventDefault();
            evorg.stopPropagation();
        };
        ik.pointermove = (ev) => {
            let dv;
            let rc = knobToInitialize.getBoundingClientRect();
            let cx = (rc.left + rc.right) * 0.5, cy = (rc.top + rc.bottom) * 0.5;
            if (ev.touches)
                ev = ev.touches[0];
            let dx = ev.clientX - ik.dragfrom.x, dy = ev.clientY - ik.dragfrom.y;
            let da = Math.atan2(ev.clientX - cx, cy - ev.clientY);
            switch (ik.itype) {
                case "k":
                    switch (options.knobMode) {
                        case "linear":
                            dv = (dx / ik.sensex - dy / ik.sensey) * (ik.valrange.max - ik.valrange.min);
                            if (ev.shiftKey)
                                dv *= 0.2;
                            knobToInitialize.setValue(ik.dragfrom.v + dv);
                            break;
                        case "circularabs":
                            if (!ev.shiftKey) {
                                dv = ik.valrange.min + (da / Math.PI * 0.75 + 0.5) * (ik.valrange.max - ik.valrange.min);
                                knobToInitialize.setValue(dv);
                                break;
                            }
                        case "circularrel":
                            if (da > ik.dragfrom.a + Math.PI) da -= Math.PI * 2;
                            if (da < ik.dragfrom.a - Math.PI) da += Math.PI * 2;
                            da -= ik.dragfrom.a;
                            dv = da / Math.PI / 1.5 * (ik.valrange.max - ik.valrange.min);
                            if (ev.shiftKey)
                                dv *= 0.2;
                            knobToInitialize.setValue(ik.dragfrom.v + dv);
                    }
                    break;
            }
        };
        ik.pointerup = () => {
            document.removeEventListener("mousemove", ik.pointermove);
            document.removeEventListener("touchmove", ik.pointermove);
            document.removeEventListener("mouseup", ik.pointerup);
            document.removeEventListener("touchend", ik.pointerup);
            document.removeEventListener("touchcancel", ik.pointerup);
            let event = document.createEvent("HTMLEvents");
            event.initEvent("change", false, true);
            knobToInitialize.dispatchEvent(event);
        };
        ik.keydown = () => {
            knobToInitialize.redraw();
        };
        knobToInitialize.redraw = (f) => {
            if (f || ik.valueold != knobToInitialize.value) {
                let v = (knobToInitialize.value - ik.valrange.min) / (ik.valrange.max - ik.valrange.min);
                if (ik.sprites >= 1)
                    knobToInitialize.style.backgroundPosition = "0px " + (-((v * ik.sprites) | 0) * ik.frameheight) + "px";
                else {
                    knobToInitialize.style.transform = "rotate(" + (270 * v - 135) + "deg)";
                }
                ik.valueold = knobToInitialize.value;
            }
        };
        knobToInitialize.refresh();
        knobToInitialize.redraw(true);
        knobToInitialize.addEventListener("keydown", ik.keydown);
        knobToInitialize.addEventListener("mousedown", ik.pointerdown);
        knobToInitialize.addEventListener("touchstart", ik.pointerdown);
    }

    function refreshQueue() {
        processingQueue = Array.from(document.querySelectorAll("input.input-knob,input.input-slider"));
    }

    let processingQueue = [];

    refreshQueue();

    for (let knob of processingQueue) {
        initializeKnob(knob);
        await sleep(1);
    }
};