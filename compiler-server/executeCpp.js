const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const outputPath = path.join(__dirname, "temp");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filePath, inputPath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const isWindows = os.platform() === "win32";

  const exePath = path.join(outputPath, isWindows ? `${jobId}.exe` : `${jobId}.out`);

  const runCommand = `"${exePath}" < "${inputPath}"`;

  return new Promise((resolve, reject) => {
    const compileCommand = `g++ -std=c++20 "${filePath}" -o "${exePath}" && ${runCommand}`;
    console.log("🔧 Running command:", compileCommand);

    exec(compileCommand, { shell: true }, (error, stdout, stderr) => {
      console.log(" stdout:", stdout);
      console.log("stderr:", stderr);
      console.log(" error:", error);

      try {
        fs.unlinkSync(filePath);
        fs.unlinkSync(inputPath);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      } catch (cleanupErr) {
        console.warn("🧹 Cleanup warning:", cleanupErr.message);
      }

      if (error) return reject({ error: stderr || error.message });
      if (stderr) return reject({ error: stderr });
      return resolve(stdout);
    });
  });
};

module.exports = { executeCpp };