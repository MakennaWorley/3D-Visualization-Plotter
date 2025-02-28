from euler import *
from visual import *
import re


def get_positive_float_input(prompt, allow_zero=False):
    while True:
        try:
            value = float(input(prompt))
            if (value > 0) or (allow_zero and value == 0):
                return value
            print("Please enter a positive number.")
        except ValueError:
            print("Invalid input. Please enter a numerical value.")

def parse_equation(equation):
    term_pattern = r'([+-]?\d*\.?\d*)\s*([A-Z])?([A-Z])?'
    terms = re.findall(term_pattern, equation.replace(" ", ""))

    #print(terms)

    growth_rate = 0
    control_rate = 0
    prey_letter = None
    predator_letter = None

    for coefficient, var1, var2 in terms:
        # No stated numerical coefficient (-F or +R)
        if coefficient in ["", "+"]:
            coefficient = 1.0
        elif coefficient == "-":
            coefficient = -1.0
        else:
            coefficient = float(coefficient)

        if var1 and not var2:
            if prey_letter is None:
                growth_rate = coefficient
                prey_letter = var1
            else:
                predator_letter = var1

        elif var1 and var2:
            control_rate = coefficient
            prey_letter = var1
            predator_letter = var2

    if not predator_letter and prey_letter:
        predator_letter = prey_letter
        prey_letter = None

    if not prey_letter or not predator_letter:
        raise ValueError("Invalid equation format. Ensure it contains prey and predator terms.")

    #print(growth_rate, control_rate, prey_letter, predator_letter)

    return growth_rate, control_rate, prey_letter, predator_letter

def set_up_prey_predator():
    while True:
        try:
            prey_equation = input("Enter the prey equation: ")
            prey_growth_rate, prey_control_rate, prey_letter, predator_letter = parse_equation(prey_equation)

            predator_equation = input("Enter the predator equation: ")
            predator_growth_rate, predator_control_rate, predator_prey_letter, predator_predator_letter = parse_equation(
                predator_equation)

            if prey_letter != predator_prey_letter or predator_letter != predator_predator_letter:
                print(f"Error: The variables in the equations must match. "
                      f"Expected '{prey_letter}' and '{predator_letter}', but got '{predator_prey_letter}' and '{predator_predator_letter}'.")
                continue

            break
        except ValueError as e:
            print(f"Invalid input: {e}")

    prey = Prey(prey_growth_rate, prey_control_rate, prey_letter, predator_letter)

    predator = Predator(predator_growth_rate, predator_control_rate, prey_letter, predator_letter)

    return prey, predator

def set_up_euler(prey, predator):
    print("\nEnter parameters for the Equation:")

    initial_prey_population = get_positive_float_input("Initial prey population: ")
    initial_predator_population = get_positive_float_input("Initial predator population: ")
    time_step = get_positive_float_input("Time step (e.g., 0.5): ")
    start_time = get_positive_float_input("Start time (e.g., 0): ", allow_zero=True)
    final_time = get_positive_float_input("Final time (must be greater than start time): ")

    while final_time <= start_time:
        print("Final time must be greater than start time.")
        final_time = get_positive_float_input("Final time (must be greater than start time): ")

    euler = Euler(initial_prey_population, initial_predator_population, prey, predator, time_step, start_time,
                     final_time)

    return euler

def main():
    prey, predator = set_up_prey_predator()

    #print("\nPrey Object:", prey)
    #print("Predator Object:", predator)

    euler = set_up_euler(prey, predator)

    print("\nEuler Object:", euler)

    data = euler.calculate_points()

    draw_graph(data)

def tst_main():
    prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    euler = set_up_euler(prey, predator)

    print("\nEuler Object:", euler)

    data = euler.calculate_points()

    draw_graph(data)

if __name__ == '__main__':
    tst_main()