# Text-to-Speech (TTS) and Retrieval-based Voice Conversion (RVC) Modules

This directory contains the modules and backend API for TTS using the ElevenLabs API and RVC using python-rvc.

## Setup and Installation

Follow these steps to set up the backend environment and install the necessary dependencies. The setup process requires an ElevenLabs API key and configuring a specialized a Python virtual environment.

### Prerequisites

*   **Python:**  Make sure you have Python **3.9** installed.

*   **Node.js and npm:** Node.js and npm (Node Package Manager) are required to run the API server.

### Virtual Environment Setup (Python)

1.  **Create a virtual environment:** Navigate to the `backend-rvc` directory in your terminal and run:
    ```bash
    python -m venv rvc-env-39
    ```
    (This creates a virtual environment named `rvc-env-39`. You can choose a different name if you prefer).

2.  **Activate the virtual environment:**
    *   **On Linux/macOS:**
        ```bash
        source rvc-env-39/bin/activate
        ```
    *   **On Windows (Command Prompt):**
        ```bash
        rvc-env-39\Scripts\activate.bat
        ```
    *   **On Windows (PowerShell):**
        ```powershell
        .\rvc-env-39\Scripts\Activate.ps1
        ```
    You should see the virtual environment name `(rvc-env-39)` appear at the beginning of your terminal prompt when it's activated.

### Install Python Dependencies

Install the required Python packages using `pip` and the `requirements.txt` file that is included in this directory:

```bash
pip install -r requirements.txt
```

### Modify Python Dependencies
In order to prevent issues with `torch` we need to make 2 modifications to `fairseq` and `rvc-python`. 
Go into your virtual environment folder and do the following:

```bash
cd lib/python3.9/site-packages/
```

Go to the `fairseq` folder and modify line 315 of `checkpoint_utils.py` with `weights_only=False`:
```bash
state = torch.load(f, map_location=torch.device("cpu"), weights_only=False)
```

Then go to the `rvc_python` folder and modify the `infer_file` method in `infer_py`. Before `wavfile.write(output_path, self.vc.tgt_sr, wav_opt)`, add the following line:
```bash
wav_opt = np.array(wav_opt)
```

### Add Models
Create a `models` dir in `backend-rvc` and a subdir for each model. Each subdir should be named after the model name, with the `model.pth` and `model.index` files inside.

### Install Node dependencies

Navigate to `backend-rvc` and run 
```bash
npm install
```

### Set ElevenLabs API Key Environment Variable
In `backend-rvc` create a `.env` file and set your API Key in it as follows:
```bash
ELEVENLABS_API_KEY="YOUR_API_KEY_HERE"
```

### Running the Backend API Server

Navigate to `backend-rvc` and run
```bash
npm run build
npm start
```
OR
```bash
npm run build
node dist/server.js
```

The API endpoint for voice conversion is `POST /api/process-audio` and the JSON request body is:
```json
{
  "text": "Text to convert to voice.",
  "voiceId": "ElevenLabs voice ID (e.g., pNInz6obpg9XYj9gQ0uk)",
  "modelName": "Name of your RVC model directory (e.g., gandalf)"
}
```

Example using curl:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the voice conversion API.",
    "voiceId": "pNInz6obpg9XYj9gQ0uk",
    "modelName": "gandalf"
  }' \
  http://localhost:3000/api/process-audio -o output_audio.wav
```