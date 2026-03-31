const { execFile } = require("child_process");
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

            // Step 3: Run binary using execFile — no shell, pass input via stdin
            const inputData = fs.readFileSync(inputPath, 'utf8');

            execFile(exePath, [], { timeout: 5000, input: inputData }, (runError, runStdout, runStderr) => {
                // Cleanup binary after running
                if (fs.existsSync(exePath)) {
                    try { fs.unlinkSync(exePath); } catch (cleanupErr) {
                        console.error("Cleanup error:", cleanupErr);
                    }
                }

                if (runError) {
                    // Correctly label TLE as its own type, not Runtime Error
                    if (runError.killed) {
                        return reject({ error: "Time Limit Exceeded (5s)", type: "Time Limit Exceeded" });
                    }
                    return reject({ error: runStderr || runError.message, type: "Runtime Error" });
                }

                resolve(runStdout);
            });
        });
    });
};

module.exports = { executeCpp };