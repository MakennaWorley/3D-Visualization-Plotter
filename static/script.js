async function runSimulation() {
    const data = {
        prey_equation: document.getElementById("prey_equation").value,
        predator_equation: document.getElementById("predator_equation").value,
        initial_prey_population: parseFloat(document.getElementById("initial_prey").value),
        initial_predator_population: parseFloat(document.getElementById("initial_predator").value),
        time_step: parseFloat(document.getElementById("time_step").value),
        start_time: parseFloat(document.getElementById("start_time").value),
        final_time: parseFloat(document.getElementById("final_time").value)
    };

    const response = await fetch("http://127.0.0.1:8000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Error: " + (await response.text()));
        return;
    }

    const result = await response.json();
    visualizeData(result.simulation_data);
}

function visualizeData(simulationData) {
    document.getElementById("graph-container").innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 300) / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 15, 15);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth - 300, window.innerHeight);
    document.getElementById("graph-container").appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth - 300, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    document.getElementById("graph-container").appendChild(labelRenderer.domElement);

    const maxTime = Math.max(...simulationData.map(d => d.time));
    const maxPrey = Math.max(...simulationData.map(d => d.prey_population));
    const maxPredator = Math.max(...simulationData.map(d => d.predator_population));

    const points = simulationData.map(d => new THREE.Vector3(d.time, d.prey_population, d.predator_population));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    function createAxis(start, end, color) {
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
        const axisGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const axisMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
        const axisLine = new THREE.Line(axisGeometry, axisMaterial);
        scene.add(axisLine);
    }

    createAxis([0, 0, 0], [maxTime, 0, 0], 0xff0000);
    createAxis([0, 0, 0], [0, maxPrey, 0], 0x0000ff);
    createAxis([0, 0, 0], [0, 0, maxPredator], 0x00ff00);

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
    createLabel("Prey", new THREE.Vector3(0, maxPrey + 2, 0));
    createLabel("Predator", new THREE.Vector3(0, 0, maxPredator + 2));

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
