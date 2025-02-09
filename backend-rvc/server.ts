import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { textToSpeech } from './modules/elevenlabs-tts.js';
import { runRVC } from './modules/rvc-module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/process-audio', async (req: Request, res: Response): Promise<void> => {
    try {
        const { text, voiceId, modelName } = req.body;

        if (!text || !voiceId || !modelName) {
            res.status(400).send({ error: 'Missing required parameters: text, voiceId, modelName' });
            return;
        }

        const ttsOutPath = path.join(__dirname, '..', 'audio', 'tts_out', `tts_output_${Date.now()}.wav`); // Unique TTS output path
        const rvcOutPath = path.join(__dirname, '..', 'audio', 'rvc_out', `rvc_output_${Date.now()}.wav`); // Unique RVC output path

        //TTS
        const ttsAudioPath = await textToSpeech(text, voiceId, ttsOutPath);
        if (!ttsAudioPath) {
            res.status(500).send({ error: 'ElevenLabs TTS failed' });
            return;
        }
        console.log(`TTS audio generated: ${ttsAudioPath}`);

        //RVC
        const rvcAudioBuffer = await runRVC(ttsAudioPath, rvcOutPath, modelName);
        if (!(rvcAudioBuffer instanceof Buffer)) {
            res.status(500).send({ error: 'RVC process failed' });
            return;
        }
        console.log(`RVC audio processed, buffer size: ${rvcAudioBuffer.length}`);

        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', 'attachment; filename=rvc_output.wav');
        res.send(rvcAudioBuffer);

        //fs.unlink(ttsAudioPath).catch(e => console.error("Error deleting temp TTS file:", e));
        //fs.unlink(rvcOutPath).catch(e => console.error("Error deleting temp RVC file:", e));

    } catch (error: any) {
        console.error("API processing error:", error);
        res.status(500).send({ error: 'API processing failed', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});