import { runRVC } from './rvc-module.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testRVCModule = async () => {
    console.log("testRVCModule() started");

    const input = path.join(__dirname, '..', 'audio/tts_out', 'elevenlabs_tts.wav');
    const output = path.join(__dirname, '..', 'audio/rvc_out', 'rvc.wav');
    const model = 'gandalf';

    console.log(`Running RVC on input audio: ${input} with model: ${model}`);
    try {
        const rvcAudioBuffer: Buffer = await runRVC(input, output, model);
        console.log(`RVC processed audio Buffer received (${rvcAudioBuffer.length} bytes).`);

        await fs.writeFile(output, rvcAudioBuffer);
        console.log(`RVC processed audio saved to: ${output}`);
        console.log("You should now be able to play rvc_output.wav");
    } catch (error: any) {
        console.error("Error running RVC process:", error);
        console.error("RVC process test failed.");
    }

    console.log("testRVCModule() finished");
}

testRVCModule();