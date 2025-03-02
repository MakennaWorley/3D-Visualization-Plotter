import { Prey, Predator, Euler, setUpPreyPredator, setUpEuler } from "./euler.js";

let camera = null;
let controls = null;
let midTime = null;
let midPrey = null;
let midPredator = null;
let maxTime = null;
let maxPrey = null;
let maxPredator = null;

function runSimulation() {
    const preyEquation = document.getElementById("prey_equation").value;
    const predatorEquation = document.getElementById("predator_equation").value;
    const initialPreyPopulation = parseFloat(document.getElementById("initial_prey").value);
    const initialPredatorPopulation = parseFloat(document.getElementById("initial_predator").value);
    const timeStep = parseFloat(document.getElementById("time_step").value);
    const startTime = parseFloat(document.getElementById("start_time").value);
    const finalTime = parseFloat(document.getElementById("final_time").value);

    try {
        const { prey, predator } = setUpPreyPredator(preyEquation, predatorEquation);
        const euler = setUpEuler(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime);
        const result = euler.calculatePoints();

        const simulationData = result.map(([time, preyPopulation, predatorPopulation]) => ({
            time,
            prey_population: preyPopulation,
            predator_population: predatorPopulation
        }));

        visualizeData(simulationData);
    } catch (error) {
        alert("Error: " + error.message);
    }
}

function visualizeData(simulationData) {
    document.getElementById("graph-container").innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 300) / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth - 300, window.innerHeight);
    document.getElementById("graph-container").appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth - 300, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    document.getElementById("graph-container").appendChild(labelRenderer.domElement);

    maxTime = Math.max(...simulationData.map(d => d.time));
    maxPrey = Math.max(...simulationData.map(d => d.prey_population));
    maxPredator = Math.max(...simulationData.map(d => d.predator_population));

    midTime = maxTime / 2;
    midPrey = maxPrey / 2;
    midPredator = maxPredator / 2;

    const points = simulationData.map(d => new THREE.Vector3(
        d.time,                 // x = time
        d.predator_population,  // y = predator
        -d.prey_population       // z = prey
    ));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    function createAxis(start, end, color) {
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
        const axisGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const axisMaterial = new THREE.LineBasicMaterial({color, linewidth: 2});
        const axisLine = new THREE.Line(axisGeometry, axisMaterial);
        scene.add(axisLine);
    }

    createAxis([0, 0, 0], [maxTime, 0, 0], 0xff0000);     // Time
    createAxis([0, 0, 0], [0, maxPredator, 0], 0x0000ff); // Predator
    createAxis([0, 0, 0], [0, 0, -maxPrey], 0x00ff00);     // Prey

    function createLabel(text, position) {
        const div = document.createElement("div");
        div.className = "label";
        div.textContent = text;
        div.style.color = "white";
        div.style.fontSize = "14px";
        div.style.fontWeight = "bold";
        div.style.padding = "5px";
        div.style.background = "rgba(0, 0, 0, 0.5)";

        const label = new THREE.CSS2DObject(div);
        label.position.set(position.x, position.y, position.z);
        scene.add(label);
        return label;
    }

    createLabel("Time", new THREE.Vector3(maxTime + 2, 0, 0));
    createLabel("Predator", new THREE.Vector3(0, maxPredator + 2, 0));
    createLabel("Prey", new THREE.Vector3(0, 0, -maxPrey - 2));

    camera.position.set(maxTime * -1, maxPredator * 1.2, maxPrey * 0.7);
    camera.lookAt(midTime, midPredator, -midPrey);
    controls.target.set(midTime, midPredator, -midPrey);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = (window.innerWidth - 300) / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 300, window.innerHeight);
        labelRenderer.setSize(window.innerWidth - 300, window.innerHeight);
    });
}

function setCameraView(view) {
    if (!camera || !controls) {
        console.warn("Camera or controls are not initialized yet.");
        return;
    }

    if (midTime === null || midPrey === null || midPredator === null) {
        console.warn("Simulation data is not initialized yet.");
        return;
    }

    switch (view) {
        case "Angler":
            // +
            camera.position.set(maxTime * -1, maxPredator * 1.2, maxPrey * 0.7);
            break;

        case "Fronter":
            // Prey-Predator +
            camera.position.set(2 * maxTime, midPredator, -midPrey);
            break;

        case "Sider":
            // Time–Predator +
            camera.position.set(midTime, midPredator, 2 * maxPrey);
            break;

        case "Topper":
            // Time–Prey
            camera.position.set(midTime, 3 * maxPredator, -midPrey);
            break;

        default:
            console.warn("Invalid view specified. Falling back to a distant perspective.");
            camera.position.set(2 * maxTime, 2 * maxPredator, -2 * maxPrey);
            break;
    }

    controls.update();
}

window.runSimulation = runSimulation;
window.setCameraView = setCameraView;
