#!/usr/bin/env python

# nohup in log file
# nohup ./run.sh python src/62-tune/main.py > src/62-tune/main-log.txt 2>&1 &
# To kill: pkill -f "python src/62-tune/main.py"

import datetime
import os
import subprocess
import os
import time
import sys
from typing import List, Optional, Union

# Configure stdout to flush immediately
sys.stdout.reconfigure(line_buffering=True)


def log_message(message):
    """Log a message with timestamp, printing to stdout and flushing immediately."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}", flush=True)


def run_screen_command(
    session_name: str,
    command: Union[str, List[str]],
    log_output: bool = True,
    working_dir: Optional[str] = None,
) -> None:
    """
    Run a command in a detached screen session.

    Args:
        session_name: Name of the screen session
        command: Command to run (string or list of arguments)
        log_output: Whether to log the output (-L flag)
        working_dir: Directory to run the command in (defaults to current dir)

    Example:
        run_screen_command("tune_xgboost", "./run.sh python src/62-tune/main.py")
        run_screen_command("tune_all", ["./run.sh", "python", "src/62-tune/main.py"])
    """
    if working_dir:
        os.chdir(working_dir)

    # Ensure logs directory exists
    log_dir = os.path.join("src", "62-tune", "logs")
    os.makedirs(log_dir, exist_ok=True)

    # Create log file path
    log_file = os.path.join(log_dir, f"{session_name}.log")

    # Convert command to string if it's a list
    if isinstance(command, list):
        command_str = " ".join(command)
    else:
        command_str = command

    # Create the command with output redirection
    command_with_logging = f"{command_str} > {log_file} 2>&1"

    # Build screen command with the modified command
    screen_cmd = ["screen", "-dmS", session_name]
    if log_output:
        screen_cmd.append("-L")

    # Execute screen command with bash -c to handle the redirection
    full_cmd = screen_cmd + ["bash", "-c", command_with_logging]

    try:
        subprocess.run(full_cmd, check=True)
        log_message(f"Started screen session '{session_name}' with log at {log_file}")
    except subprocess.CalledProcessError as e:
        log_message(f"Error starting screen session: {e}")
        raise


def kill_all_screen_sessions():
    """
    Kill all screen sessions.
    """
    # use killall screen, ignore errors if no screen sessions found
    try:
        subprocess.run(["killall", "screen"], check=False)
    except Exception as e:
        log_message(f"Error when killing screen sessions: {e}, continuing anyway.")


ONE_HOUR = 3600 + 120
# ONE_HOUR = 60
COOL_DOWN_TIME = 10


def run_not_include_llm_features():
    log_message("Start tuning adaboost - not include llm features")

    for i in range(15):
        run_screen_command(
            f"adaboost-{i}-without-llm", "./run.sh python src/62-tune/adaboost/main.py"
        )

    time.sleep(ONE_HOUR)

    log_message("Time's up for adaboost - not include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning catboost - not include llm features")

    for i in range(4):
        run_screen_command(
            f"catboost-{i}-without-llm", "./run.sh python src/62-tune/catboost/main.py"
        )

    time.sleep(ONE_HOUR)

    log_message("Time's up for catboost - not include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning lightgbm - not include llm features")

    # one only
    run_screen_command("lightgbm-1-without-llm", "./run.sh python src/62-tune/lightgbm/main.py")

    time.sleep(ONE_HOUR)

    log_message("Time's up for lightgbm - not include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning random forest - not include llm features")

    # random forest 4
    for i in range(4):
        run_screen_command(
            f"random-forest-{i}-without-llm", "./run.sh python src/62-tune/random-forest/main.py"
        )

    time.sleep(ONE_HOUR)

    log_message("Time's up for random forest - not include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning xgboost - not include llm features")

    # xgboost 1
    run_screen_command("xgboost-1-without-llm", "./run.sh python src/62-tune/xgboost/main.py")

    time.sleep(ONE_HOUR)

    log_message("Time's up for xgboost - not include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()


# Include LLM features
def include_llm_features():
    log_message("Start tuning adaboost - include llm features")

    for i in range(15):
        run_screen_command(
            f"adaboost-{i}-with-llm", "./run.sh python src/66-tune-include-llm/adaboost/main.py"
        )

    time.sleep(ONE_HOUR)

    log_message("Time's up for adaboost - include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning catboost - include llm features")

    for i in range(4):
        run_screen_command(
            f"catboost-{i}-with-llm", "./run.sh python src/66-tune-include-llm/catboost/main.py"
        )

    time.sleep(ONE_HOUR)

    log_message("Time's up for catboost - include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning lightgbm - include llm features")

    # one only
    run_screen_command("lightgbm-1-with-llm", "./run.sh python src/66-tune-include-llm/lightgbm/main.py")

    time.sleep(ONE_HOUR)

    log_message("Time's up for lightgbm - include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning random forest - include llm features")

    # random forest 4
    for i in range(4):
        run_screen_command(
            f"random-forest-{i}-with-llm", "./run.sh python src/66-tune-include-llm/random-forest/main.py"
        )

    time.sleep(ONE_HOUR)

    log_message("Time's up for random forest - include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()

    time.sleep(COOL_DOWN_TIME)

    log_message("Start tuning xgboost - include llm features")

    # xgboost 1
    run_screen_command("xgboost-1-with-llm", "./run.sh python src/66-tune-include-llm/xgboost/main.py")

    time.sleep(ONE_HOUR)

    log_message("Time's up for xgboost - include llm features")

    # kill all screen sessions
    kill_all_screen_sessions()


def main():
    """
    Run all model tuning in separate screen sessions.
    """

    run_not_include_llm_features()
    include_llm_features()
    log_message("All screen sessions killed")


if __name__ == "__main__":
    main()
