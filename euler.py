from tabulate import tabulate

class Prey:
    def __init__(self, growth_rate, control_rate, prey_letter, predator_letter):
        self.growth_rate = growth_rate
        self.control_rate = control_rate
        self.prey_letter = prey_letter
        self.predator_letter = predator_letter

    def change_in_prey(self, prey_population, predator_population):
        v = self.growth_rate * prey_population + self.control_rate * prey_population * predator_population
        # print("temp prey", v)
        return v

    def __str__(self):
        return f"Prey equation: {self.growth_rate}{self.prey_letter} + {self.control_rate}{self.prey_letter}{self.predator_letter}"


class Predator:
    def __init__(self, growth_rate, control_rate, prey_letter, predator_letter):
        self.growth_rate = growth_rate
        self.control_rate = control_rate
        self.prey_letter = prey_letter
        self.predator_letter = predator_letter

    def change_in_predator(self, prey_population, predator_population):
        v = self.growth_rate * predator_population + self.control_rate * prey_population * predator_population
        # print("temp predator", v)
        return v

    def __str__(self):
        return f"Predator equation: {self.growth_rate}{self.predator_letter} + {self.control_rate}{self.prey_letter}{self.predator_letter}"


class Euler:
    def __init__(self, initial_prey_population, initial_predator_population, prey, predator, time_step, start_time,
                 final_time):
        self.prey_population = initial_prey_population
        self.predator_population = initial_predator_population
        self.prey = prey
        self.predator = predator
        self.time_step = time_step
        self.start_time = start_time
        self.final_time = final_time

    def __str__(self):
        return (
            f"Initial prey population: {self.prey_population}\n"
            f"Initial predator population: {self.predator_population}\n"
            f"Time step: {self.time_step} to {self.final_time}\n"
            f"{self.prey}\n"
            f"{self.predator}"
        )

    def calculate_table(self):
        time = self.start_time
        d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
        d_predator = self.predator.change_in_predator(self.prey_population,
                                                      self.predator_population)
        results = [(time, self.prey_population, d_prey, self.predator_population, d_predator)]

        self.prey_population += (d_prey * self.time_step)
        self.predator_population += (d_predator * self.time_step)

        while time < self.final_time:
            d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
            d_predator = self.predator.change_in_predator(self.prey_population,
                                                          self.predator_population)
            self.prey_population += (d_prey * self.time_step)
            self.predator_population += (d_predator * self.time_step)
            time += self.time_step

            results.append((time, self.prey_population, d_prey, self.predator_population, d_predator))

        return results

    def calculate_points(self):
        time = self.start_time
        d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
        d_predator = self.predator.change_in_predator(self.prey_population,
                                                      self.predator_population)
        results = [(time, self.prey_population, self.predator_population)]

        self.prey_population += (d_prey * self.time_step)
        self.predator_population += (d_predator * self.time_step)

        while time < self.final_time:
            d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
            d_predator = self.predator.change_in_predator(self.prey_population,
                                                          self.predator_population)
            self.prey_population += (d_prey * self.time_step)
            self.predator_population += (d_predator * self.time_step)
            time += self.time_step

            results.append((time, self.prey_population, self.predator_population))

        return results

    def print_table(self, results):
        headers = ["Time", "Prey", "ΔPrey", "Predator", "ΔPredator"]
        table_data = [[f"{t:.2f}", f"{prey:.4f}", f"{d_prey:.4f}", f"{predator:.4f}", f"{d_predator:.4f}"] for
                      t, prey, d_prey, predator, d_predator in results]

        print("\n" + tabulate(table_data, headers=headers, tablefmt="grid"))

    def print_points(self, results):
        headers = ["Time", "Prey", "Predator"]
        table_data = [[f"{t:.2f}", f"{prey:.4f}", f"{predator:.4f}"] for
                      t, prey, predator, in results]

        print("\n" + tabulate(table_data, headers=headers, tablefmt="grid"))


def main():
    prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    euler = Euler(initial_prey_population=1, initial_predator_population=1, prey=prey, predator=predator,
                     time_step=0.5, start_time=0, final_time=1)

    print(euler)

    euler.print_table(euler.calculate_table())

    '''prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    euler = Euler(initial_prey_population=1, initial_predator_population=1, prey=prey, predator=predator,
                     time_step=0.5, start_time=0, final_time=1)

    euler.print_points(euler.calculate_points())'''


if __name__ == "__main__":
    main()
