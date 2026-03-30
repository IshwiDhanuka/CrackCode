const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '2mb' }));

app.get("/", (req, res) => {
    res.json({ online: 'compiler', status: 'healthy' });
});

app.post("/run", async (req, res) => {
    const {
        language = 'cpp',
        code,
        testcases,
        functionName,
        className,
        arguments: args,   // comma-separated type string e.g. "vector<int>,int"
        returnType
    } = req.body;

    // Validation
    if (!code || code.trim() === '') {
        return res.status(400).json({ success: false, error: "Empty code submitted." });
    }
    if (!Array.isArray(testcases) || testcases.length === 0) {
        return res.status(400).json({ success: false, error: "No testcases provided." });
    }
    if (!functionName) {
        return res.status(400).json({ success: false, error: "functionName is required." });
    }

    // Generate the .cpp file ONCE — shared across all test cases
    let filePath;
    try {
        filePath = await generateFile(language, code, {
            functionName,
            className: className || 'Solution',
            argumentTypes: args || '',   // <-- KEY FIX: pass argumentTypes
            returnType: returnType || 'void'
        });
    } catch (genError) {
        console.error('File generation error:', genError);
        return res.status(500).json({
            success: false,
            error: genError.message || 'Failed to generate code file',
            type: 'Generation Error'
        });
    }

    const results = [];
    const inputPaths = [];

    try {
        for (const tc of testcases) {
            let inputPath;
            try {
                inputPath = await generateInputFile(tc.input || '');
                inputPaths.push(inputPath);
            } catch (inputError) {
                throw new Error(`Failed to generate input file for test case: ${inputError.message || inputError}`);
            }

            const expected = tc.expectedOutput == null ? '' : String(tc.expectedOutput).trim();
            try {
                const output = await executeCpp(filePath, inputPath);
                const actual = output.trim();
                results.push({
                    input: tc.input,
                    output: actual,
                    expected,
                    passed: actual === expected
                });
            } catch (execError) {
                // One test case failed — record it and continue
                results.push({
                    input: tc.input,
                    output: execError.error || 'Execution failed',
                    expected,
                    passed: false,
                    errorType: execError.type || 'Runtime Error'
                });
                // If compilation error, no point running more cases
                if (execError.type === 'Compilation Error') {
                    // Fill remaining with same error
                    for (let i = results.length; i < testcases.length; i++) {
                        const expectedRem = testcases[i].expectedOutput == null ? '' : String(testcases[i].expectedOutput).trim();
                        results.push({
                            input: testcases[i].input,
                            output: execError.error,
                            expected: expectedRem,
                            passed: false,
                            errorType: 'Compilation Error'
                        });
                    }
                    break;
                }
            }
        }

        res.json({ success: true, results });

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({
            success: false,
            error: error.error || error.message || "Execution failed",
            type: error.type || "Unknown Error"
        });
    } finally {
        // Cleanup all generated input files
        for (const p of inputPaths) {
            if (fs.existsSync(p)) {
                try { fs.unlinkSync(p); } catch (_) {}
            }
        }
        // Cleanup the generated .cpp source file
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (_) {}
        }
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Compiler server listening on port ${PORT}`);
});