import time


def wait_for_task(task):
    print("Waiting for Earth Engine task...")

    while task.active():
        status = task.status()
        print("State:", status["state"])
        time.sleep(10)

    status = task.status()

    if status["state"] != "COMPLETED":
        print("Task failed:", status)
        raise Exception("Earth Engine export failed.")

    print("Task completed successfully.")
