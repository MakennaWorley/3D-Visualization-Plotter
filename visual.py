import numpy as np
import vispy.scene
from vispy.scene import visuals
import vispy.app

def draw_graph(data):
    data = np.array(data)

    time = data[:, 0]
    prey = data[:, 1]
    predator = data[:, 2]

    canvas = vispy.scene.SceneCanvas(keys='interactive', show=True, bgcolor='black', size=(800, 600))
    view = canvas.central_widget.add_view()

    x_center = (time.min() + time.max()) / 2
    y_center = (prey.min() + prey.max()) / 2
    z_center = (predator.min() + predator.max()) / 2

    max_range = max(time.ptp(), prey.ptp(), predator.ptp())
    view.camera = vispy.scene.cameras.TurntableCamera(
        center=(x_center, y_center, z_center),
        azimuth=45,
        distance=max_range * 1.5
    )

    line = visuals.Line(pos=np.c_[time, prey, predator], color='blue', width=1)
    view.add(line)

    x_min, x_max = time.min(), time.max()
    y_min, y_max = prey.min(), prey.max()
    z_min, z_max = predator.min(), predator.max()

    x_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_max, y_min, z_min]]), color='red', width=2)
    y_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_min, y_max, z_min]]), color='blue', width=2)
    z_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_min, y_min, z_max]]), color='green', width=2)

    view.add(x_axis)
    view.add(y_axis)
    view.add(z_axis)

    vispy.app.run()

def main():
    data = np.column_stack(
        (np.linspace(0, 25, 2500), np.sin(np.linspace(0, 25, 2500)), np.cos(np.linspace(0, 25, 2500))))
    draw_graph(data)

if __name__ == "__main__":
    main()