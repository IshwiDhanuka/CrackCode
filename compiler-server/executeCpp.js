const { exec } = require("child_process");
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
        // Step 1: Compile the code
        const compileCommand = `g++ -std=c++20 "${filePath}" -o "${exePath}"`;
        
        exec(compileCommand, (error, stdout, stderr) => {
            if (error) {
                return reject({ error: stderr || error.message, type: "Compilation Error" });
            }

            // Step 2: Run the binary
            // FIX: Removed the "./" because exePath is already an absolute path.
            // Added chmod +x just in case to ensure the binary is executable.
            const runCommand = `chmod +x "${exePath}" && "${exePath}" < "${inputPath}"`;
            
            exec(runCommand, { timeout: 5000 }, (runError, runStdout, runStderr) => {
                // Cleanup binary after running to save space in the container
                if (fs.existsSync(exePath)) {
                    try {
                        fs.unlinkSync(exePath);
                    } catch (cleanupErr) {
                        console.error("Cleanup error:", cleanupErr);
                    }
                }

                if (runError) {
                    if (runError.killed) {
                        return reject({ error: "Time Limit Exceeded (5s)", type: "Runtime Error" });
                    }
                    return reject({ error: runStderr || runError.message, type: "Runtime Error" });
                }
                
                resolve(runStdout);
            });
        });
    });
};

module.exports = { executeCpp };