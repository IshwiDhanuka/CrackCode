const { execFile, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure the temp directory exists for the compiled binaries
const outputPath = path.join(__dirname, "temp");
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filePath, inputPath) => {
    const jobId = path.basename(filePath).split(".")[0];
    const exePath = path.join(outputPath, `${jobId}.out`);

    return new Promise((resolve, reject) => {
        // Step 1: Compile using execFile — no shell interpolation, prevents command injection
        execFile("g++", ["-std=c++20", filePath, "-o", exePath], (error, stdout, stderr) => {
            if (error) {
                return reject({ error: stderr || error.message, type: "Compilation Error" });
            }

            // Step 2: Make executable
            try {
                fs.chmodSync(exePath, 0o755);
            } catch (chmodErr) {
                return reject({ error: "Failed to set executable permissions", type: "Runtime Error" });
            }

            // Step 3: Run binary using spawn — properly pipes stdin
            const inputData = fs.readFileSync(inputPath, 'utf8');
            console.log(`[DEBUG] Job: ${jobId}`);
            console.log(`[DEBUG] Input data: ${JSON.stringify(inputData)}`);
            console.log(`[DEBUG] ExePath: ${exePath}`);

            const child = spawn(exePath, [], { timeout: 5000 });

            let runStdout = '';
            let runStderr = '';

            child.stdout.on('data', d => runStdout += d);
            child.stderr.on('data', d => runStderr += d);

            // Write input to stdin and close it
            child.stdin.write(inputData);
            child.stdin.end();

            child.on('close', (code, signal) => {
                // Cleanup binary after running
                if (fs.existsSync(exePath)) {
                    try { fs.unlinkSync(exePath); } catch (cleanupErr) {
                        console.error("Cleanup error:", cleanupErr);
                    }
                }

                console.log(`[DEBUG] runStdout: ${JSON.stringify(runStdout)}`);
                console.log(`[DEBUG] runStderr: ${JSON.stringify(runStderr)}`);
                console.log(`[DEBUG] code: ${code}, signal: ${signal}`);

                if (signal === 'SIGTERM' || code === null) {
                    return reject({ error: "Time Limit Exceeded (5s)", type: "Time Limit Exceeded" });
                }
                if (code !== 0) {
                    return reject({ error: runStderr || 'Runtime error', type: "Runtime Error" });
                }
                resolve(runStdout);
            });

            child.on('error', err => {
                console.log(`[DEBUG] spawn error: ${err.message}`);
                reject({ error: err.message, type: "Runtime Error" });
            });
        });
    });
};

module.exports = { executeCpp };