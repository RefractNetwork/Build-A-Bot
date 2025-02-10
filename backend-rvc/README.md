# RVC (Retrieval-based Voice Conversion) API

This directory contains the backend API for real-time voice conversion using RVC (Retrieval-based Voice Conversion) and ElevenLabs Text-to-Speech.

## Setup and Installation

Follow these steps to set up the backend environment and install the necessary dependencies.

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
In order to prevent issues with running rvc-python we need to make 2 modifications to fairseq and rvc-python. 
Go into your virtual environment folder and do the following:

```bash
cd lib/python3.9/site-packages/
```

Go to the folder for fairseq and in *checkpoint_utils.py* modify line 315 to use *weights_only=False*:
```bash
state = torch.load(f, map_location=torch.device("cpu"), weights_only=False)
```

Then go to the folder for rvc_python and in *infer.py* in the *infer_file* method, add the following line before wavfile.write():
```bash
wav_opt = np.array(wav_opt)
```

### Install node dependencies

Navigate to backend-rvc and run 
```bash
npm install
```

### Set ElevenLabs API Key Environment Variable

```bash
export ELEVENLABS_API_KEY="YOUR_ELEVENLABS_API_KEY_HERE"
```


### Running the Backend API Server

Navigate to backend-rvc and run
```bash
npm run build
npm start
```
OR
```bash
npm run build
node dist/server.js
```

The API endpoint for voice conversion is *POST /api/process-audio* and the JSON request body is:
{
  "text": "Text to convert to voice.",
  "voiceId": "ElevenLabs voice ID (e.g., pNInz6obpg9XYj9gQ0uk)",
  "modelName": "Name of your RVC model directory (e.g., gandalf)"
}

Example using curl:
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the voice conversion API.",
    "voiceId": "pNInz6obpg9XYj9gQ0uk",
    "modelName": "gandalf"
  }' \
  http://localhost:3000/api/process-audio -o output_audio.wav





