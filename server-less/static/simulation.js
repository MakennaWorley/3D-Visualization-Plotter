import { showAlert } from "./display.js";

class Prey {
    constructor(growthRate, controlRate, preyLetter, predatorLetter) {
        this.growthRate = growthRate;
        this.controlRate = controlRate;
        this.preyLetter = preyLetter;
        this.predatorLetter = predatorLetter;
    }

    toString() {
        return `Prey equation: ${this.growthRate}${this.preyLetter} + ${this.controlRate}${this.preyLetter}${this.predatorLetter}`;
    }

    changeInPrey(preyPopulation, predatorPopulation) {
        if (preyPopulation === 0) return 0;

        return this.growthRate * preyPopulation + this.controlRate * preyPopulation * predatorPopulation;
    }

    getPreyLetter() {
        return this.preyLetter;
    }
}

class Predator {
    constructor(growthRate, controlRate, preyLetter, predatorLetter) {
        this.growthRate = growthRate;
        this.controlRate = controlRate;
        this.preyLetter = preyLetter;
        this.predatorLetter = predatorLetter;
    }

    toString() {
        return `Predator equation: ${this.growthRate}${this.predatorLetter} + ${this.controlRate}${this.preyLetter}${this.predatorLetter}`;
    }

    changeInPredator(preyPopulation, predatorPopulation) {
        if (predatorPopulation === 0) return 0;

        return this.growthRate * predatorPopulation + this.controlRate * preyPopulation * predatorPopulation;
    }

    getPredatorLetter() {
        return this.predatorLetter;
    }
}

export class Euler {
    constructor(initialPreyPopulation, initialPredatorPopulation, prey, predator, timeStep, startTime, finalTime) {
        this.preyPopulation = initialPreyPopulation;
        this.predatorPopulation = initialPredatorPopulation;
        this.prey = prey;
        this.predator = predator;
        this.timeStep = timeStep;
        this.startTime = startTime;
        this.finalTime = finalTime;
    }

    calculatePoints() {
        let time = this.startTime;
        let dPrey = this.prey.changeInPrey(this.preyPopulation, this.predatorPopulation);
        let dPredator = this.predator.changeInPredator(this.preyPopulation, this.predatorPopulation);

        let results = [[time, this.preyPopulation, dPrey, this.predatorPopulation, dPredator]];

        this.preyPopulation = (this.preyPopulation === 0) ? 0 : Math.max(0, this.preyPopulation + (dPrey * this.timeStep));
        this.predatorPopulation = (this.predatorPopulation === 0) ? 0 : Math.max(0, this.predatorPopulation + (dPredator * this.timeStep));

        while (time < this.finalTime) {
            dPrey = this.prey.changeInPrey(this.preyPopulation, this.predatorPopulation);
            dPredator = this.predator.changeInPredator(this.preyPopulation, this.predatorPopulation);

            this.preyPopulation = (this.preyPopulation === 0) ? 0 : Math.max(0, this.preyPopulation + (dPrey * this.timeStep));
            this.predatorPopulation = (this.predatorPopulation === 0) ? 0 : Math.max(0, this.predatorPopulation + (dPredator * this.timeStep));
            time += this.timeStep;

            results.push([time, this.preyPopulation, dPrey, this.predatorPopulation, dPredator]);
        }
        return results;
    }
}

class RungeKutta {
    constructor(initialPreyPopulation, initialPredatorPopulation, prey, predator, timeStep, startTime, finalTime) {
        this.preyPopulation = initialPreyPopulation;
        this.predatorPopulation = initialPredatorPopulation;
        this.prey = prey;
        this.predator = predator;
        this.timeStep = timeStep;
        this.startTime = startTime;
        this.finalTime = finalTime;
    }

    calculatePoints() {
        let h = this.timeStep;
        let time = this.startTime;
        let results = [];

        let currentPrey = this.preyPopulation;
        let currentPred = this.predatorPopulation;

        let k1Prey = this.prey.changeInPrey(currentPrey, currentPred);
        let k1Pred = this.predator.changeInPredator(currentPrey, currentPred);

        let k2Prey = this.prey.changeInPrey(currentPrey + 0.5 * h * k1Prey, currentPred + 0.5 * h * k1Pred);
        let k2Pred = this.predator.changeInPredator(currentPrey + 0.5 * h * k1Prey, currentPred + 0.5 * h * k1Pred);

        let k3Prey = this.prey.changeInPrey(currentPrey + 0.5 * h * k2Prey, currentPred + 0.5 * h * k2Pred);
        let k3Pred = this.predator.changeInPredator(currentPrey + 0.5 * h * k2Prey, currentPred + 0.5 * h * k2Pred);

        let k4Prey = this.prey.changeInPrey(currentPrey + h * k3Prey, currentPred + h * k3Pred);
        let k4Pred = this.predator.changeInPredator(currentPrey + h * k3Prey, currentPred + h * k3Pred);

        let dPrey = (k1Prey + 2 * k2Prey + 2 * k3Prey + k4Prey) / 6;
        let dPredator = (k1Pred + 2 * k2Pred + 2 * k3Pred + k4Pred) / 6;

        results.push([time, currentPrey, dPrey, currentPred, dPredator]);

        while (time < this.finalTime) {
            k1Prey = this.prey.changeInPrey(currentPrey, currentPred);
            k1Pred = this.predator.changeInPredator(currentPrey, currentPred);

            k2Prey = this.prey.changeInPrey(currentPrey + 0.5 * h * k1Prey, currentPred + 0.5 * h * k1Pred);
            k2Pred = this.predator.changeInPredator(currentPrey + 0.5 * h * k1Prey, currentPred + 0.5 * h * k1Pred);

            k3Prey = this.prey.changeInPrey(currentPrey + 0.5 * h * k2Prey, currentPred + 0.5 * h * k2Pred);
            k3Pred = this.predator.changeInPredator(currentPrey + 0.5 * h * k2Prey, currentPred + 0.5 * h * k2Pred);

            k4Prey = this.prey.changeInPrey(currentPrey + h * k3Prey, currentPred + h * k3Pred);
            k4Pred = this.predator.changeInPredator(currentPrey + h * k3Prey, currentPred + h * k3Pred);

            dPrey = (k1Prey + 2 * k2Prey + 2 * k3Prey + k4Prey) / 6;
            dPredator = (k1Pred + 2 * k2Pred + 2 * k3Pred + k4Pred) / 6;

            // Update populations using the weighted average slope
            currentPrey = (currentPrey === 0) ? 0 : Math.max(0, currentPrey + h * dPrey);
            currentPred = (currentPred === 0) ? 0 : Math.max(0, currentPred + h * dPredator);
            time += h;

            results.push([time, currentPrey, dPrey, currentPred, dPredator]);
        }
        this.preyPopulation = currentPrey;
        this.predatorPopulation = currentPred;

        return results;
    }
}

export function parseEquation(equation) {
    try {
        const termPattern = /([+-]?\d*\.?\d+|\d+|[+-])?\*?([A-Z])(?:\*?([A-Z]))?/g;
        let terms = [...equation.replace(/\s/g, "").matchAll(termPattern)];

        console.log("Matched terms:", terms);

        let growthRate = 0, controlRate = 0;
        let preyLetter = null, predatorLetter = null;

        for (let [_, coefficient, var1, var2] of terms) {
        coefficient = coefficient === "" || coefficient === "+" ? 1.0 : coefficient === "-" ? -1.0 : parseFloat(coefficient);

            if (isNaN(coefficient)) {
                showAlert(`Could not parse the coefficient: "${coefficient}"`);
                return;
            }

            if (var1 && !var2) {
                if (!preyLetter) {
                    growthRate = coefficient;
                    preyLetter = var1;
                } else {
                    predatorLetter = var1;
                }
            } else if (var1 && var2) {
                controlRate = coefficient;
                preyLetter = var1;
                predatorLetter = var2;
            }
        }

        if (!predatorLetter && preyLetter) {
            predatorLetter = preyLetter;
            preyLetter = null;
        }

        if (!preyLetter || !predatorLetter) {
            showAlert("Invalid equation format. Ensure it contains prey and predator terms.");
            return;
        }

        console.log("Parsed values:", { growthRate, controlRate, preyLetter, predatorLetter });
        return {growthRate, controlRate, preyLetter, predatorLetter};
    } catch (error) {
        showAlert("Cannot parse equation: " + equation);
        return;
    }
}

export function setUpPreyPredator(preyEquation, predatorEquation) {
    try {
        let preyParams = parseEquation(preyEquation);
        let predatorParams = parseEquation(predatorEquation);

        if (preyParams.preyLetter !== predatorParams.preyLetter || preyParams.predatorLetter !== predatorParams.predatorLetter) {
            throw new Error("Error: The variables in the equations must match.");
        }

        let prey = new Prey(preyParams.growthRate, preyParams.controlRate, preyParams.preyLetter, preyParams.predatorLetter);
        let predator = new Predator(predatorParams.growthRate, predatorParams.controlRate, preyParams.preyLetter, preyParams.predatorLetter);

        return { prey, predator };
    } catch (error) {
        showAlert("Error setting up prey and predator: " + error.message);
        return;
    }
}

export function setUpEuler(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime) {
    if (finalTime <= startTime) {
        showAlert("Final time must be greater than start time.");
        return;
    }
    return new Euler(initialPreyPopulation, initialPredatorPopulation, prey, predator, timeStep, startTime, finalTime);
}

export function setUpRungeKutta(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime) {
    if (finalTime <= startTime) {
        showAlert("Final time must be greater than start time.");
        return;
    }
    return new RungeKutta(initialPreyPopulation, initialPredatorPopulation, prey, predator, timeStep, startTime, finalTime);
}
