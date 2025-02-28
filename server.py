from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from euler import Euler, Prey, Predator
from main import parse_equation

import math

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("templates/index.html", "r") as f:
        return f.read()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PreyPredatorInput(BaseModel):
    prey_equation: str
    predator_equation: str
    initial_prey_population: float
    initial_predator_population: float
    time_step: float
    start_time: float
    final_time: float

@app.post("/simulate")
def simulate(input_data: PreyPredatorInput):
    try:
        prey_growth_rate, prey_control_rate, prey_letter, predator_letter = parse_equation(input_data.prey_equation)
        predator_growth_rate, predator_control_rate, _, _ = parse_equation(input_data.predator_equation)

        prey = Prey(prey_growth_rate, prey_control_rate, prey_letter, predator_letter)
        predator = Predator(predator_growth_rate, predator_control_rate, prey_letter, predator_letter)

        euler = Euler(input_data.initial_prey_population, input_data.initial_predator_population,
                      prey, predator, input_data.time_step, input_data.start_time, input_data.final_time)

        data = euler.calculate_points()

        cleaned_data = [
            {"time": t, "prey_population": prey, "predator_population": predator}
            for t, prey, predator in data
            if not (math.isinf(prey) or math.isnan(prey) or math.isinf(predator) or math.isnan(predator))
        ]

        if not cleaned_data:
            raise ValueError("Simulation failed: all values resulted in NaN or Infinity.")

        return {"simulation_data": cleaned_data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
