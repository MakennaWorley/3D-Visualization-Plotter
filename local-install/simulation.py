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

        self.prey_population = max(0, self.prey_population + (d_prey * self.time_step))
        self.predator_population = max(0, self.predator_population + (d_predator * self.time_step))

        while time < self.final_time:
            d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
            d_predator = self.predator.change_in_predator(self.prey_population,
                                                          self.predator_population)
            self.prey_population = max(0, self.prey_population + (d_prey * self.time_step))
            self.predator_population = max(0, self.predator_population + (d_predator * self.time_step))
            time += self.time_step

            results.append((time, self.prey_population, d_prey, self.predator_population, d_predator))

        return results

    def calculate_points(self):
        time = self.start_time
        d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
        d_predator = self.predator.change_in_predator(self.prey_population,
                                                      self.predator_population)
        results = [(time, self.prey_population, self.predator_population)]

        self.prey_population = max(0, self.prey_population + (d_prey * self.time_step))
        self.predator_population = max(0, self.predator_population + (d_predator * self.time_step))

        while time < self.final_time:
            d_prey = self.prey.change_in_prey(self.prey_population, self.predator_population)
            d_predator = self.predator.change_in_predator(self.prey_population,
                                                          self.predator_population)
            self.prey_population = max(0, self.prey_population + (d_prey * self.time_step))
            self.predator_population = max(0, self.predator_population + (d_predator * self.time_step))
            time += self.time_step

            results.append((time, self.prey_population, self.predator_population))

        return results


class RungeKutta:
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
            f"Time step: {self.time_step} from {self.start_time} to {self.final_time}\n"
            f"{self.prey}\n"
            f"{self.predator}"
        )

    def calculate_table(self):
        h = self.time_step
        time = self.start_time
        results = []

        current_prey = self.prey_population
        current_pred = self.predator_population

        k1_prey = self.prey.change_in_prey(current_prey, current_pred)
        k1_pred = self.predator.change_in_predator(current_prey, current_pred)
        k2_prey = self.prey.change_in_prey(current_prey + 0.5 * h * k1_prey, current_pred + 0.5 * h * k1_pred)
        k2_pred = self.predator.change_in_predator(current_prey + 0.5 * h * k1_prey, current_pred + 0.5 * h * k1_pred)
        k3_prey = self.prey.change_in_prey(current_prey + 0.5 * h * k2_prey, current_pred + 0.5 * h * k2_pred)
        k3_pred = self.predator.change_in_predator(current_prey + 0.5 * h * k2_prey, current_pred + 0.5 * h * k2_pred)
        k4_prey = self.prey.change_in_prey(current_prey + h * k3_prey, current_pred + h * k3_pred)
        k4_pred = self.predator.change_in_predator(current_prey + h * k3_prey, current_pred + h * k3_pred)

        delta_prey = (k1_prey + 2 * k2_prey + 2 * k3_prey + k4_prey) / 6
        delta_pred = (k1_pred + 2 * k2_pred + 2 * k3_pred + k4_pred) / 6

        results.append((time, current_prey, delta_prey, current_pred, delta_pred))

        while time < self.final_time:
            k1_prey = self.prey.change_in_prey(current_prey, current_pred)
            k1_pred = self.predator.change_in_predator(current_prey, current_pred)

            k2_prey = self.prey.change_in_prey(current_prey + 0.5 * h * k1_prey, current_pred + 0.5 * h * k1_pred)
            k2_pred = self.predator.change_in_predator(current_prey + 0.5 * h * k1_prey,
                                                       current_pred + 0.5 * h * k1_pred)

            k3_prey = self.prey.change_in_prey(current_prey + 0.5 * h * k2_prey, current_pred + 0.5 * h * k2_pred)
            k3_pred = self.predator.change_in_predator(current_prey + 0.5 * h * k2_prey,
                                                       current_pred + 0.5 * h * k2_pred)

            k4_prey = self.prey.change_in_prey(current_prey + h * k3_prey, current_pred + h * k3_pred)
            k4_pred = self.predator.change_in_predator(current_prey + h * k3_prey, current_pred + h * k3_pred)

            delta_prey = (k1_prey + 2 * k2_prey + 2 * k3_prey + k4_prey) / 6
            delta_pred = (k1_pred + 2 * k2_pred + 2 * k3_pred + k4_pred) / 6

            # Update populations using the weighted average slope
            current_prey = max(0, current_prey + h * delta_prey)
            current_pred = max(0, current_pred + h * delta_pred)
            time += h

            results.append((time, current_prey, delta_prey, current_pred, delta_pred))

        self.prey_population = current_prey
        self.predator_population = current_pred
        return results

    def calculate_points(self):
        h = self.time_step
        time = self.start_time
        results = []

        current_prey = self.prey_population
        current_pred = self.predator_population

        results.append((time, current_prey, current_pred))

        while time < self.final_time:
            k1_prey = self.prey.change_in_prey(current_prey, current_pred)
            k1_pred = self.predator.change_in_predator(current_prey, current_pred)

            k2_prey = self.prey.change_in_prey(current_prey + 0.5 * h * k1_prey, current_pred + 0.5 * h * k1_pred)
            k2_pred = self.predator.change_in_predator(current_prey + 0.5 * h * k1_prey,
                                                       current_pred + 0.5 * h * k1_pred)

            k3_prey = self.prey.change_in_prey(current_prey + 0.5 * h * k2_prey, current_pred + 0.5 * h * k2_pred)
            k3_pred = self.predator.change_in_predator(current_prey + 0.5 * h * k2_prey,
                                                       current_pred + 0.5 * h * k2_pred)

            k4_prey = self.prey.change_in_prey(current_prey + h * k3_prey, current_pred + h * k3_pred)
            k4_pred = self.predator.change_in_predator(current_prey + h * k3_prey, current_pred + h * k3_pred)

            delta_prey = (k1_prey + 2 * k2_prey + 2 * k3_prey + k4_prey) / 6
            delta_pred = (k1_pred + 2 * k2_pred + 2 * k3_pred + k4_pred) / 6

            current_prey = max(0, current_prey + h * delta_prey)
            current_pred = max(0, current_pred + h * delta_pred)
            time += h

            results.append((time, current_prey, current_pred))

        self.prey_population = current_prey
        self.predator_population = current_pred
        return results

class Visualizer:
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
    '''prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    euler = Euler(initial_prey_population=1, initial_predator_population=1, prey=prey, predator=predator,
                     time_step=0.05, start_time=0, final_time=12)

    visualizer = Visualizer()

    print(euler)

    visualizer.print_table(euler.calculate_table())

    prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    euler = Euler(initial_prey_population=1, initial_predator_population=1, prey=prey, predator=predator,
                     time_step=0.5, start_time=0, final_time=1)

    visualizer.print_points(euler.calculate_points())'''

    prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    rk = RungeKutta(initial_prey_population=1, initial_predator_population=1, prey=prey, predator=predator,
                  time_step=0.05, start_time=0, final_time=12)

    visualizer = Visualizer()

    print(rk)

    visualizer.print_table(rk.calculate_table())

    prey = Prey(growth_rate=3, control_rate=-1.4, prey_letter="R", predator_letter="F")
    predator = Predator(growth_rate=-1, control_rate=0.8, prey_letter="R", predator_letter="F")

    rk = RungeKutta(initial_prey_population=1, initial_predator_population=1, prey=prey, predator=predator,
                     time_step=0.5, start_time=0, final_time=1)

    visualizer.print_points(rk.calculate_points())


if __name__ == "__main__":
    main()
