export default class Part {
    constructor(name) {
        this.name = name;
        this.score = [];
        this.script = null;
    }

    async load(score, scriptName) {
        this.score = score;

        const scriptPath = `./static/${scriptName}.js`;
        this.script = await fetch(scriptPath).then(response => response.text());
    }
}