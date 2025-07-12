const express = require('express');
const util = require('util');
const app = express();
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});


app.post("/run", async (req, res) => {
    const { language = 'cpp', code, input = '' } = req.body;

    if (!code || code.trim() === '') {
        return res.status(400).json({
            success: false,
            error: "Empty code! Please provide some code to execute."
        });
    }

    try {
        const filePath = await generateFile(language, code);
        const inputPath = await generateInputFile(input);

        const output = await executeCpp(filePath, inputPath);

        return res.json({
            success: true,
            output
        });

    } catch (error) {
        console.error(' Error executing code:', error);

        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error || {}));
        console.error('Error JSON:', JSON.stringify(error, null, 2));

        function safeStringify(obj) {
            const seen = new WeakSet();
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return "[Circular]";
                    }
                    seen.add(value);
                }
                return value;
            }, 2);
        }

        let actualError;

        if (typeof error === 'string') {
            actualError = error;
        } else if (error instanceof Error) {
            actualError = error.message;
            if (error.stderr) {
                actualError += `\nCompiler stderr: ${error.stderr}`;
            }
        } else if (error?.error) {
            if (typeof error.error === 'string') {
                actualError = error.error;
            } else {
                actualError = safeStringify(error.error);
            }
        } else if (typeof error === 'object') {
            actualError = util.inspect(error, { depth: 5, colors: false });
        } else {
            actualError = safeStringify(error);
        }

        return res.status(500).json({
            success: false,
            error: actualError
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(` Compiler server is listening on port ${PORT}`);
});