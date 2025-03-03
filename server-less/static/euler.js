export class Prey {
    constructor(growthRate, controlRate, preyLetter, predatorLetter) {
        this.growthRate = growthRate;
        this.controlRate = controlRate;
        this.preyLetter = preyLetter;
        this.predatorLetter = predatorLetter;
    }

    changeInPrey(preyPopulation, predatorPopulation) {
        return this.growthRate * preyPopulation + this.controlRate * preyPopulation * predatorPopulation;
    }

    getPreyLetter() {
        return this.preyLetter;
    }
}

export class Predator {
    constructor(growthRate, controlRate, preyLetter, predatorLetter) {
        this.growthRate = growthRate;
        this.controlRate = controlRate;
        this.preyLetter = preyLetter;
        this.predatorLetter = predatorLetter;
    }

    changeInPredator(preyPopulation, predatorPopulation) {
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
        let results = [[time, this.preyPopulation, this.predatorPopulation]];

        while (time < this.finalTime) {
            let dPrey = this.prey.changeInPrey(this.preyPopulation, this.predatorPopulation);
            let dPredator = this.predator.changeInPredator(this.preyPopulation, this.predatorPopulation);

            this.preyPopulation = Math.max(0, this.preyPopulation + (dPrey * this.timeStep));
            this.predatorPopulation = Math.max(0, this.predatorPopulation + (dPredator * this.timeStep));
            time += this.timeStep;

            results.push([time, this.preyPopulation, this.predatorPopulation]);
        }
        return results;
    }
}

export function parseEquation(equation) {
    const termPattern = /([+-]?\d*\.?\d*)\s*([A-Z])?([A-Z])?/g;
    let terms = [...equation.replace(/\s/g, "").matchAll(termPattern)];

    let growthRate = 0, controlRate = 0;
    let preyLetter = null, predatorLetter = null;

    for (let [_, coefficient, var1, var2] of terms) {
        coefficient = coefficient === "" || coefficient === "+" ? 1.0 : coefficient === "-" ? -1.0 : parseFloat(coefficient);

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
        throw new Error("Invalid equation format. Ensure it contains prey and predator terms.");
    }
    return { growthRate, controlRate, preyLetter, predatorLetter };
}

export function setUpPreyPredator(preyEquation, predatorEquation) {
    let preyParams = parseEquation(preyEquation);
    let predatorParams = parseEquation(predatorEquation);

    if (preyParams.preyLetter !== predatorParams.preyLetter || preyParams.predatorLetter !== predatorParams.predatorLetter) {
        throw new Error("Error: The variables in the equations must match.");
    }

    let prey = new Prey(preyParams.growthRate, preyParams.controlRate, preyParams.preyLetter, preyParams.predatorLetter);
    let predator = new Predator(predatorParams.growthRate, predatorParams.controlRate, preyParams.preyLetter, preyParams.predatorLetter);

    return { prey, predator };
}

export function setUpEuler(prey, predator, initialPreyPopulation, initialPredatorPopulation, timeStep, startTime, finalTime) {
    if (finalTime <= startTime) {
        throw new Error("Final time must be greater than start time.");
    }
    return new Euler(initialPreyPopulation, initialPredatorPopulation, prey, predator, timeStep, startTime, finalTime);
}
