import { setUpPreyPredator, setUpEuler, setUpRungeKutta } from "./simulation.js";

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
    const startTime = 0;
    const finalTime = parseFloat(document.getElementById("final_time").value);

    try {
        const { prey, predator } = setUpPreyPredator(preyEquation, predatorEquation);

        //console.log(prey, predator)

        const method = document.querySelector('input[name="method"]:checked').value;
        let simulation;

        if (method === "runge-kutta") {
            simulation = setUpRungeKutta(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime);
        } else {
            simulation = setUpEuler(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime);
        }

        //console.log(simulation)

        const result = simulation.calculatePoints();

        const simulationData = result.map(([time, preyPopulation, dPrey, predatorPopulation, dPredator]) => ({
            time,
            prey_population: preyPopulation,
            d_prey: dPrey,
            predator_population: predatorPopulation,
            d_predator: dPredator
        }));

        return {
            simulationData,
            preyLetter: prey.getPreyLetter(),
            predatorLetter: predator.getPredatorLetter()
        };
    } catch (error) {
        console.error("Error:", error.message);
        alert("Error: " + error.message);
    }
}

function visualizeData(data, preyLetter, predatorLetter) {
    document.getElementById("graph-container").innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    let renderer = null;
    let initialWidth = window.innerWidth;

    if (initialWidth <= 800) {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("graph-container").appendChild(renderer.domElement);
    } else {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth - 300, window.innerHeight);
        document.getElementById("graph-container").appendChild(renderer.domElement);
    }

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const labelRenderer = new THREE.CSS2DRenderer();

    if (initialWidth <= 800) {
        labelRenderer.setSize(initialWidth, window.innerHeight);
    } else {
        labelRenderer.setSize(initialWidth - 300, window.innerHeight);
    }

    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    document.getElementById("graph-container").appendChild(labelRenderer.domElement);

    maxTime = Math.max(...data.map(d => d.time));
    maxPrey = Math.max(...data.map(d => d.prey_population));
    maxPredator = Math.max(...data.map(d => d.predator_population));

    midTime = maxTime / 2;
    midPrey = maxPrey / 2;
    midPredator = maxPredator / 2;

    const points = data.map(({ time, prey_population, predator_population }) => {
        return new THREE.Vector3(time, predator_population, -prey_population);  // z = prey
    });

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

    createAxis([0, 0, 0], [maxTime, 0, 0], 0xff0000);       // Time
    createAxis([0, 0, 0], [0, maxPredator, 0], 0x0000ff);   // Predator
    createAxis([0, 0, 0], [0, 0, -maxPrey], 0x00ff00);      // Prey

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

    createLabel("Time", new THREE.Vector3(maxTime, 0, 0));
    createLabel(predatorLetter, new THREE.Vector3(0, maxPredator, 0));
    createLabel(preyLetter, new THREE.Vector3(0, 0, -maxPrey));

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

    document.querySelector(".navigation").style.display = "block";

    window.observeInnerWidth((width) => {
        const effectiveWidth = width <= 800 ? width : width - 300;
        camera.aspect = effectiveWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(effectiveWidth, window.innerHeight);
        labelRenderer.setSize(effectiveWidth, window.innerHeight);
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
            camera.position.set(maxTime * -1, maxPredator * 1.2, maxPrey * 0.7);
            break;
        case "Fronter":
            camera.position.set(2 * maxTime, midPredator, -midPrey);
            break;
        case "Sider":
            camera.position.set(midTime, midPredator, 3 * maxPrey);
            break;
        case "Topper":
            camera.position.set(midTime, 3 * maxPredator, -midPrey);
            break;
        default:
            console.warn("Invalid view specified. Falling back to a distant perspective.");
            camera.position.set(2 * maxTime, 2 * maxPredator, -2 * maxPrey);
            break;
    }

    controls.update();
}

function observeInnerWidth(callback) {
    callback(window.innerWidth);
    window.addEventListener('resize', () => {
        callback(window.innerWidth);
    });
}

function printTable(data, preyLetter, predatorLetter) {
    const tableContainer = document.getElementById("dataTable");

    if (!tableContainer) {
        console.error("Error: Element with ID 'dataTable' not found.");
        return;
    }

    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("data-table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = ["Time", preyLetter, "Δ" + preyLetter, predatorLetter, "Δ" + predatorLetter];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach(({ time, prey_population, d_prey, predator_population, d_predator }) => {
        const row = document.createElement("tr");

        [time.toFixed(2), prey_population.toFixed(4), d_prey.toFixed(4), predator_population.toFixed(4), d_predator.toFixed(4)]
            .forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                row.appendChild(td);
            });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function generateData() {
    const simulationResult = runSimulation();

    if (!simulationResult) {
        console.error("Simulation failed. No data returned.");
        return;
    }

    const { simulationData, preyLetter, predatorLetter } = simulationResult;

    //console.log(simulationData);

    visualizeData(simulationData, preyLetter, predatorLetter);
    printTable(simulationData, preyLetter, predatorLetter);
}

window.generateData = generateData;
window.setCameraView = setCameraView;
window.observeInnerWidth = observeInnerWidth;

document.addEventListener("DOMContentLoaded", function () {
    const uiPanel = document.getElementById("ui");
    const toggleButton = document.getElementById("toggle-ui");
    const graphContainer = document.getElementById("graph-container");
    const navigationPanel = document.querySelector(".navigation");

    function updateUIPanelScrolling() {
        uiPanel.style.height = "";
        uiPanel.style.overflowY = "";
    }

    function checkScreenSize(width) {
        const currentWidth = width || window.innerWidth;

        if (currentWidth <= 800) {
            uiPanel.classList.add("collapsed");
            toggleButton.style.display = "flex";
            toggleButton.innerHTML = "▼";
            graphContainer.style.width = "100%";
            graphContainer.style.height = "calc(100vh - 50px)";
        } else {
            uiPanel.classList.remove("collapsed");
            uiPanel.style.height = "100%";
            toggleButton.style.display = "none";
            graphContainer.style.width = "";
            graphContainer.style.height = "";
        }

        updateUIPanelScrolling();
    }

    window.observeInnerWidth(checkScreenSize);
    checkScreenSize();

    toggleButton.addEventListener("click", function () {
        uiPanel.classList.toggle("collapsed");
        if (uiPanel.classList.contains("collapsed")) {
            toggleButton.innerHTML = "▼";
        } else {
            toggleButton.innerHTML = "▲";
        }
        updateUIPanelScrolling();
    });
});
