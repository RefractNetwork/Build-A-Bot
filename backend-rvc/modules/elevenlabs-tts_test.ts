import { textToSpeech } from './elevenlabs-tts.js';
import { fileURLToPath } from 'url';
import path from 'path';

const testElevenLabs = async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.log("testElevenLabs() function started");

    const text = "Hello, this is a test of the ElevenLabs text-to-speech API using TypeScript and the official client library.";
    const outPath = path.join(__dirname, '..', 'audio/tts_out', 'elevenlabs_tts.wav');
    const voiceID = '21m00Tcm4TlvDq8ikWAM'; //Rachel

    console.log(`Generating speech for text: "${text}" using voiceId: ${voiceID}...`);
    const filename = await textToSpeech(text, voiceID, outPath);

    if (filename) {
        console.log(`Test audio file created: ${filename}`);
        console.log("You should now be able to play test_elevenlabs_audio.wav");
    } else {
        console.error("Failed to generate or save ElevenLabs audio.");
    }

    console.log("testElevenLabs() function finished");
}

testElevenLabs();