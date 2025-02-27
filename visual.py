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

    x_center = (min(time) + max(time)) / 2
    y_center = (min(prey) + max(prey)) / 2
    z_center = (min(predator) + max(predator)) / 2

    view.camera = vispy.scene.cameras.TurntableCamera(
        center=(x_center, y_center, z_center),
        azimuth=45,
        distance=max(max(time) - min(time), max(prey) - min(prey), max(predator) - min(predator)) * 2
    )

    scatter = visuals.Markers()
    scatter.set_data(np.c_[time, prey, predator], edge_color=None, face_color='blue', size=5)
    view.add(scatter)

    x_min, x_max = min(time), max(time)
    y_min, y_max = min(prey), max(prey)
    z_min, z_max = min(predator), max(predator)

    line_width = 2

    x_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_max, y_min, z_min]]), color='red',
                          width=line_width, parent=view.scene)
    y_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_min, y_max, z_min]]), color='blue',
                          width=line_width, parent=view.scene)
    z_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_min, y_min, z_max]]), color='green',
                          width=line_width, parent=view.scene)

    vispy.app.run()

def main():
    data = [(0, 0, 0), (5, 0, 0), (0, 10, 0), (0, 0, 15)]
    draw_graph(data)

if __name__ == "__main__":
    main()