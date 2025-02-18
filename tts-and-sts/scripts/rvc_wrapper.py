import argparse
import subprocess
import os

def main():
    parser = argparse.ArgumentParser(description="Run rvc-python voice conversion CLI with specified input and model")
    parser.add_argument("input_filename", help="Input filename without extension")
    parser.add_argument("model_name", help="Model name without extension")

    args = parser.parse_args()

    input_filename = args.input_filename
    model_name = args.model_name

    input_path = os.path.join("./input", f"{input_filename}.wav")
    output_path = os.path.join("./output", f"{input_filename}_{model_name}.wav")
    model_path = os.path.join("./models", model_name, "model.pth")
    index_path = os.path.join("./models", model_name, "model.index")

    if not os.path.isfile(input_path):
        print(f"Error: Input file not found: {input_path}")
        return 1  # Indicate error

    if not os.path.isfile(model_path):
        print(f"Error: Model file not found: {model_path}")
        return 1

    if not os.path.isfile(index_path):
        print(f"Error: Index file not found: {index_path}")
        return 1

    print("Running voice conversion...")
    command = [
        "python", "-m", "rvc_python", "cli",
        "-i", input_path,
        "-o", output_path,
        "-mp", model_path,
        "-ip", index_path
    ]

    try:
        subprocess.run(command, check=True)
        print(f"Voice conversion completed. Output file: {output_path}")
        return 0  # Indicate success
    except subprocess.CalledProcessError as e:
        print(f"Error during voice conversion:")
        print(e)
        return 1  # Indicate error
    except FileNotFoundError:
        print("Error: python or rvc_python module not found. Ensure 'rvc-env-39' virtual environment is activated.")
        return 1

if __name__ == "__main__":
    exit(main())