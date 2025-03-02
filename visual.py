import numpy as np
import vispy.scene
import vispy.app
import math

from vispy.scene import visuals

g_view = None
g_camera = None

max_time = None
max_prey = None
max_predator = None
mid_time = None
mid_prey = None
mid_predator = None

def _set_camera_from_position_and_target(cam, position, target):
    px, py, pz = position
    tx, ty, tz = target

    vx = px - tx
    vy = py - ty
    vz = pz - tz

    distance = math.sqrt(vx*vx + vy*vy + vz*vz)
    azimuth = math.degrees(math.atan2(vz, vx))
    elevation = math.degrees(math.asin(vy / distance))

    cam.center = target
    cam.distance = distance
    cam.azimuth = azimuth
    cam.elevation = elevation

def draw_graph(data):
    global g_view, g_camera
    global max_time, max_prey, max_predator
    global mid_time, mid_prey, mid_predator

    data = np.array(data)

    time = data[:, 0]
    prey = data[:, 1]
    predator = data[:, 2]

    canvas = vispy.scene.SceneCanvas(keys='interactive', show=True, bgcolor='black', size=(800, 600))
    g_view = canvas.central_widget.add_view()

    x_min, x_max = time.min(), time.max()
    y_min, y_max = prey.min(), prey.max()
    z_min, z_max = predator.min(), predator.max()

    max_time = x_max
    max_prey = y_max
    max_predator = z_max

    mid_time = (x_min + x_max) / 2.0
    mid_prey = (y_min + y_max) / 2.0
    mid_predator = (z_min + z_max) / 2.0

    g_camera = vispy.scene.cameras.TurntableCamera(fov=75)
    g_view.camera = g_camera

    line = visuals.Line(
        pos=np.c_[time, prey, predator],
        color='white',
        width=1
    )
    g_view.add(line)

    x_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_max, y_min, z_min]]),
                          color='red', width=2)
    y_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_min, y_max, z_min]]),
                          color='green', width=2)
    z_axis = visuals.Line(pos=np.array([[x_min, y_min, z_min], [x_min, y_min, z_max]]),
                          color='blue', width=2)

    g_view.add(x_axis)
    g_view.add(y_axis)
    g_view.add(z_axis)

    label_time = visuals.Text(
        text="Time",
        color='white',
        pos=(x_max, y_min, z_min),
        parent=g_view.scene,
        font_size=48,
        anchor_x='center',
        anchor_y='center',
    )
    label_prey = visuals.Text(
        text="Prey",
        color='white',
        pos=(x_min, y_max, z_min),
        parent=g_view.scene,
        font_size=48,
        anchor_x='center',
        anchor_y='center',
    )
    label_predator = visuals.Text(
        text="Predator",
        color='white',
        pos=(x_min, y_min, z_max),
        parent=g_view.scene,
        font_size=48,
        anchor_x='center',
        anchor_y='center',
    )

    init_cam_pos = (x_max * -1, z_max * 1.2, y_max * 0.7)
    init_cam_target = (mid_time, mid_predator, mid_prey * -1)
    _set_camera_from_position_and_target(g_camera, init_cam_pos, init_cam_target)

    vispy.app.run()

def set_camera_view(view_name: str):
    global g_camera
    if g_camera is None:
        print("Camera not initialized yet. Run draw_graph(...) first.")
        return

    if None in (max_time, max_prey, max_predator, mid_time, mid_prey, mid_predator):
        print("Data not initialized. Draw the graph before setting camera view.")
        return

    if view_name == "Angler":
        cam_pos = (
            -max_time,  # x
            1.2 * max_predator,  # y
            0.7 * max_prey  # z
        )
        cam_target = (mid_time, mid_predator, -mid_prey)

    elif view_name == "Fronter":
        cam_pos = (
            2 * max_time,
            mid_predator,
            -mid_prey
        )
        cam_target = (mid_time, mid_predator, -mid_prey)

    elif view_name == "Sider":
        cam_pos = (
            mid_time,
            mid_predator,
            2 * max_prey
        )
        cam_target = (mid_time, mid_predator, -mid_prey)

    elif view_name == "Topper":
        cam_pos = (
            mid_time,
            3 * max_predator,
            -mid_prey
        )
        cam_target = (mid_time, mid_predator, -mid_prey)

    else:
        print("Invalid view specified. Falling back to a distant perspective.")
        cam_pos = (
            2 * max_time,
            2 * max_predator,
            -2 * max_prey
        )
        cam_target = (mid_time, mid_predator, -mid_prey)

    _set_camera_from_position_and_target(g_camera, cam_pos, cam_target)

def main():
    data = np.column_stack(
        (np.linspace(0, 25, 2500), np.sin(np.linspace(0, 25, 2500)), np.cos(np.linspace(0, 25, 2500))))
    draw_graph(data)

if __name__ == "__main__":
    main()