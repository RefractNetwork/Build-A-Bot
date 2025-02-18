import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runRVC = async (inPath: string, outPath: string, model: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        const activateVenv = '/home/ubuntu/rvc-proj/rvc-env-39/bin/activate';
        const rvcCLI = `source ${activateVenv} && python -m rvc_python cli`;
        const modelPath = path.join(__dirname, '..', 'models', model, 'model.pth');
        const indexPath = path.join(__dirname, '..', 'models', model, 'model.index');

        const bashCommand = `${rvcCLI} --input "${inPath}" --output "${outPath}" --model "${modelPath}" --index "${indexPath}"`;

        console.log(`Running bash command: ${bashCommand}`);

        const rvcProcess = spawn('bash', ['-c', bashCommand]);

        let stderrOutput = '';

        rvcProcess.stdout.on('data', (data) => {
            console.log(`RVC CLI stdout: ${data}`);
        });

        rvcProcess.stderr.on('data', (data) => {
            console.error(`RVC CLI stderr: ${data}`);
            stderrOutput += data.toString();
        });

        rvcProcess.on('close', async (code) => {
            console.log(`RVC CLI process exited with code ${code}`);
            if (code === 0) {
                try {
                    const audioBuffer = await fs.readFile(outPath);
                    resolve(audioBuffer); //Resolve promise with Buffer
                } catch (readFileError) {
                    reject(new Error(`Failed to read output audio file: ${readFileError}`));
                }
            } else {
                reject(new Error(`RVC CLI process failed with code ${code}. Stderr: ${stderrOutput}`));
            }
        });

        rvcProcess.on('error', (err) => {
            reject(new Error(`Failed to start RVC CLI process: ${err}`));
        });
    });
}