import {setUpEuler, setUpPreyPredator, setUpRungeKutta} from "./simulation.js";

const helpIcon = document.getElementById("help-icon");
const helpModal = document.getElementById("help-modal");
const closeHelp = document.getElementById("close-help");

const alpha = 1e-6; // Lower bound limit
const beta = 1e5; // Upper bound for points on graph
const MAX_RENDER_POINTS = 10000;

let camera, controls, renderer, scene;
let midTime, midPrey, midPredator;
let maxTime, maxPrey, maxPredator;

let is2D = false;
let currentView = "3D";

let globalSimulationData = [];
let globalPreyLetter = "";
let globalPredatorLetter = "";

let error = false;

function runSimulation() {
    try {
        const preyEquation = document.getElementById("prey_equation").value;
        const predatorEquation = document.getElementById("predator_equation").value;
        const initialPreyPopulation = parseFloat(document.getElementById("initial_prey").value);
        const initialPredatorPopulation = parseFloat(document.getElementById("initial_predator").value);
        const timeStep = parseFloat(document.getElementById("time_step").value);
        const startTime = 0;
        const finalTime = parseFloat(document.getElementById("final_time").value);

        if ([initialPreyPopulation, initialPredatorPopulation, timeStep, finalTime].some(isNaN)) {
            showAlert("Error: Please enter valid numbers for all inputs.");
            error = true;
            return;
        }

        if (initialPreyPopulation < 0 || initialPredatorPopulation < 0) {
            showAlert("Error: Initial populations cannot be negative.");
            error = true;
            return;
        }

        if (timeStep <= 0) {
            showAlert("Error: Time step must be positive.");
            error = true;
            return;
        }

        if (finalTime <= startTime) {
            showAlert("Error: Final time must be greater than the start time.");
            error = true;
            return;
        }

        const totalSteps = Math.ceil((finalTime - startTime) / timeStep);
        if (totalSteps > MAX_RENDER_POINTS) {
            showAlert(`Error: Too many datapoints to render (${totalSteps}). Please reduce final time or increase time step.`);
            error = true;
            return;
        }

        const preypredator = setUpPreyPredator(preyEquation, predatorEquation);
        if (preypredator === "warning") {
            error = true;
            return;
        }

        const {prey, predator} = preypredator;

        const method = document.querySelector('input[name="method"]:checked').value;
        let simulationSetup = (
            method === "runge-kutta"
                ? setUpRungeKutta
                : setUpEuler
        )(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime);

        if (simulationSetup === "warning") {
            error = true;
            return;
        }

        const result = simulationSetup.calculatePoints();

        if (!result.length) {
            showAlert("Simulation produced no valid results.");
            error = true;
            return;
        }

        return {
            simulationData: result.map(([time, preyPopulation, dPrey, predatorPopulation, dPredator]) => ({
                time,
                prey_population: preyPopulation,
                d_prey: dPrey,
                predator_population: predatorPopulation,
                d_predator: dPredator
            })),
            preyLetter: prey.getPreyLetter(),
            predatorLetter: predator.getPredatorLetter()
        };
    } catch (error) {
        showAlert(error.message);
    }
}

function visualizeData(data, preyLetter, predatorLetter, selectedView = "3D") {
    if (!data || data.length === 0) {
        if (!error) {
            showAlert("Error: Could not generate data. Please check your inputs.");
        }
        return;
    }

    document.getElementById("graph-container").innerHTML = "";

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

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
    maxPrey = Math.max(1, ...data.map(d => d.prey_population));
    maxPredator = Math.max(1, ...data.map(d => d.predator_population));

    midTime = maxTime / 2;
    midPrey = maxPrey / 2;
    midPredator = maxPredator / 2;

    if (data.length > MAX_RENDER_POINTS) {
        showAlert("Too many data points. Consider reducing final time or increasing time step.");
        return;
    }

    if (maxPrey > beta || maxPredator > beta) {
        showAlert("Error: One of the max values for prey or predator is too big for three.js to generate");
        return;
    }

    const points = getPointsForView(selectedView, data);

    if (!points.length) {
        showAlert("Error: Could not generate data. Please check your inputs.");
        return;
    } else if (points.length > beta) {
        showAlert("Error: Please reduce your final time and/or increase timestep. three.js can't render that many points.");
        return
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xffffff})));

    createAxes(selectedView);
    positionCamera(selectedView);

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }

    animate();

    document.querySelector(".navigation").style.display = "block";
    document.getElementById("toggle-table").style.display = "block";

    window.observeInnerWidth((width) => {
        const effectiveWidth = width <= 800 ? width : width - 300;
        camera.aspect = effectiveWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(effectiveWidth, window.innerHeight);
        labelRenderer.setSize(effectiveWidth, window.innerHeight);
    });
}

function getPointsForView(view, data) {
    return data.map(({time, prey_population, predator_population}) => {
        switch (view) {
            case "Fronter":  // Prey vs Predator
                return new THREE.Vector3(
                    prey_population !== 0 ? prey_population : alpha,
                    predator_population !== 0 ? predator_population : alpha,
                    0
                );
            case "Sider":  // Predator vs Time
                return new THREE.Vector3(
                    time,
                    predator_population !== 0 ? predator_population : alpha,
                    0
                );
            case "Topper":  // Prey vs Time
                return new THREE.Vector3(
                    time,
                    prey_population !== 0 ? prey_population : alpha,
                    0
                );
            default:
                return new THREE.Vector3(
                    time,
                    predator_population !== 0 ? predator_population : alpha,
                    prey_population !== 0 ? -prey_population : -alpha
                );
        }
    }).filter(p => p !== null);
}

function createAxes(view) {
    function createAxis(start, end, color) {
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
        const axisGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const axisMaterial = new THREE.LineBasicMaterial({color});
        const axisLine = new THREE.Line(axisGeometry, axisMaterial);
        scene.add(axisLine);
    }

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

    if (view === "Fronter") {
        // X = Prey, Y = Predator
        createAxis([0, 0, 0], [maxPrey, 0, 0], 0x00ff00);      // Prey axis
        createAxis([0, 0, 0], [0, maxPredator, 0], 0x0000ff);  // Predator axis

        createLabel(globalPreyLetter, new THREE.Vector3(maxPrey, 0, 0));
        createLabel(globalPredatorLetter, new THREE.Vector3(0, maxPredator, 0));
    } else if (view === "Sider") {
        // X = Time, Y = Predator
        createAxis([0, 0, 0], [maxTime, 0, 0], 0xff0000);      // Time axis
        createAxis([0, 0, 0], [0, maxPredator, 0], 0x0000ff);  // Predator axis

        createLabel("Time", new THREE.Vector3(maxTime, 0, 0));
        createLabel(globalPredatorLetter, new THREE.Vector3(0, maxPredator, 0));
    } else if (view === "Topper") {
        // X = Time, Y = Prey
        createAxis([0, 0, 0], [maxTime, 0, 0], 0xff0000);      // Time axis
        createAxis([0, 0, 0], [0, maxPrey, 0], 0x00ff00);       // Prey axis

        createLabel("Time", new THREE.Vector3(maxTime, 0, 0));
        createLabel(globalPreyLetter, new THREE.Vector3(0, maxPrey, 0));
    } else {
        // 3D axes: X = Time, Y = Predator, Z = -Prey
        createAxis([0, 0, 0], [maxTime, 0, 0], 0xff0000);       // Time
        createAxis([0, 0, 0], [0, maxPredator, 0], 0x0000ff);   // Predator
        createAxis([0, 0, 0], [0, 0, -maxPrey], 0x00ff00);      // Prey

        createLabel("Time", new THREE.Vector3(maxTime, 0, 0));
        createLabel(globalPredatorLetter, new THREE.Vector3(0, maxPredator, 0));
        createLabel(globalPreyLetter, new THREE.Vector3(0, 0, -maxPrey));
    }
}

function positionCamera(view) {
    if (view === "Fronter") {
        camera.position.set(midPrey, midPredator, 10);
        camera.lookAt(midPrey, midPredator, 0);
        controls.target.set(midPrey, midPredator, 0);
    } else if (view === "Sider") {
        camera.position.set(midTime, midPredator, 10);
        camera.lookAt(midTime, midPredator, 0);
        controls.target.set(midTime, midPredator, 0);
    } else if (view === "Topper") {
        camera.position.set(midTime, midPrey, 10);
        camera.lookAt(midTime, midPrey, 0);
        controls.target.set(midTime, midPrey, 0);
    } else {
        camera.position.set(-maxTime, maxPredator * 1.2, maxPrey * 0.7);
        camera.lookAt(midTime, midPredator, -midPrey);
        controls.target.set(midTime, midPredator, -midPrey);
    }
    controls.update();
}

function switchView(newView) {
    if (!globalSimulationData.length) {
        console.warn("No simulation data available yet.");
        return;
    }

    currentView = newView;
    is2D = (newView !== "3D");

    document.getElementById("graph-container").innerHTML = "";
    visualizeData(globalSimulationData, globalPreyLetter, globalPredatorLetter, newView);

    document.getElementById("return-to-3d").style.display = is2D ? "block" : "none";
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
    data.forEach(({time, prey_population, d_prey, predator_population, d_predator}) => {
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

    if (!simulationResult || typeof simulationResult !== "object") {
        console.log("simulationResult is wrong");
        if (!error) {
            console.log("error is false");
            showAlert("Error: Simulation failed. No data returned.");
        }
        error = true;
        return;
    }

    const {simulationData, preyLetter, predatorLetter} = simulationResult;

    globalSimulationData = simulationData;
    globalPreyLetter = preyLetter;
    globalPredatorLetter = predatorLetter;

    currentView = "3D";
    visualizeData(globalSimulationData, globalPreyLetter, globalPredatorLetter, currentView);
    printTable(globalSimulationData, globalPreyLetter, globalPredatorLetter);
}

export function showAlert(message) {
    const alertBox = document.getElementById("custom-alert");
    const alertMessage = document.getElementById("alert-message");
    const closeButton = document.getElementById("close-alert");

    alertMessage.textContent = message;
    alertBox.style.display = "flex";

    closeButton.replaceWith(closeButton.cloneNode(true));

    document.getElementById("close-alert").addEventListener("click", function () {
        alertBox.style.display = "none";
    });
}

export function showWarning(message) {
    const warningBox = document.getElementById("custom-warning");
    const warningMessage = document.getElementById("warning-message");
    const closeButton = document.getElementById("close-warning");

    warningMessage.textContent = message;
    warningBox.style.display = "flex";

    closeButton.replaceWith(closeButton.cloneNode(true));

    document.getElementById("close-warning").addEventListener("click", function () {
        warningBox.style.display = "none";
    });
}

window.generateData = generateData;
window.setCameraView = switchView;
window.observeInnerWidth = observeInnerWidth;

document.addEventListener("DOMContentLoaded", function () {
    const uiPanel = document.getElementById("ui");
    const toggleButtonUI = document.getElementById("toggle-ui");
    const graphContainer = document.getElementById("graph-container");
    const toggleButtonTable = document.getElementById("toggle-table");
    const tableContainer = document.getElementById("table-container");

    function updateUIPanelScrolling() {
        uiPanel.style.height = "";
        uiPanel.style.overflowY = "";
    }

    function checkScreenSize(width) {
        const currentWidth = width || window.innerWidth;

        if (currentWidth <= 800) {
            uiPanel.classList.add("collapsed");
            toggleButtonUI.style.display = "flex";
            toggleButtonUI.innerHTML = "▼";
            graphContainer.style.width = "100%";
            graphContainer.style.height = "calc(100vh - 50px)";

            tableContainer.classList.remove("drawer");
            tableContainer.classList.add("mobile");
        } else {
            uiPanel.classList.remove("collapsed");
            uiPanel.style.height = "100%";
            toggleButtonUI.style.display = "none";
            graphContainer.style.width = "";
            graphContainer.style.height = "";

            tableContainer.classList.remove("mobile");
            tableContainer.classList.add("drawer");
        }

        updateUIPanelScrolling();
    }

    window.observeInnerWidth(checkScreenSize);
    checkScreenSize();

    toggleButtonUI.addEventListener("click", function () {
        uiPanel.classList.toggle("collapsed");

        toggleButtonUI.innerHTML = uiPanel.classList.contains("collapsed") ? "▼" : "▲";
        updateUIPanelScrolling();
    });

    toggleButtonTable.addEventListener("click", function () {
        tableContainer.classList.toggle("open");

        if (tableContainer.classList.contains("open")) {
            document.body.classList.add("table-open");
            toggleButtonTable.innerHTML = "▶";
        } else {
            document.body.classList.remove("table-open");
            toggleButtonTable.innerHTML = "◀";
        }
    });
});

document.getElementById("return-to-3d").addEventListener("click", () => {
    switchView("3D");
});

helpIcon.addEventListener("click", () => {
    helpModal.style.display = "flex";
});

helpIcon.addEventListener("touchstart", () => {
    helpModal.style.display = "flex";
});

closeHelp.addEventListener("click", () => {
    helpModal.style.display = "none";
});

helpIcon.addEventListener("click", openHelpModal);
helpIcon.addEventListener("touchstart", openHelpModal);
closeHelp.addEventListener("click", closeHelpModal);
