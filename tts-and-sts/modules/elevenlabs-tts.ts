import fs from 'node:fs';
import * as dotenv from 'dotenv';
import { ElevenLabsClient } from "elevenlabs";

dotenv.config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export const textToSpeech = async (text: string, voiceID: string, outPath: string): Promise<string | undefined> => {
  if (!ELEVENLABS_API_KEY) {
      console.error("Error: ELEVENLABS_API_KEY environment variable not set.");
      return undefined;
  }

  const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

  try {
      const audioStream = await client.textToSpeech.convert(voiceID, {
        output_format: "mp3_44100_128",
        text: text,
        model_id: "eleven_flash_v2"
      });

      const writer = fs.createWriteStream(outPath);
      audioStream.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });


      console.log(`ElevenLabs audio saved to: ${outPath}`);
      return outPath;

  } catch (error: any) {
      console.error("Error during ElevenLabs API call:", error);
      return undefined;
  }
}