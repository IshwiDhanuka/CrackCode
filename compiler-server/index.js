const express = require('express');
const util = require('util');
const cors = require('cors');

const app = express();
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});

app.post("/run", async (req, res) => {
    const { 
        language = 'cpp', 
        code, 
        testcases, 
        functionName, 
        className, 
        arguments: args 
    } = req.body;

    // 1. Basic Validation
    if (!code || code.trim() === '') {
        return res.status(400).json({
            success: false,
            error: "Empty code! Please provide some code to execute."
        });
    }

    try {
        const results = [];

         // A. Generate the .cpp file with the hidden 'main' driver
            const filePath = await generateFile(language, code, {
                functionName,
                className
            });


        // 2. Loop through each test case
        for (const tc of testcases) {
           
            // B. Create a physical .txt file from the 'Clean' database input
            // tc.input should now be "4 3 6 7 11 8"
            const inputPath = await generateInputFile(tc.input || '');

            // C. Execute: This now uses '<' to pipe the .txt file into the binary
            const output = await executeCpp(filePath, inputPath);

            // D. Compare result and push to array
            results.push({
                input: tc.input,
                output: output.trim(),
                expected: tc.expectedOutput,
                passed: output.trim() === tc.expectedOutput.trim()
            });
        }

        // 3. Return the batch results
        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Execution Error:', error);
        console.log("FULL EXECUTION ERROR:", error);
        
        // Handle compilation vs runtime errors specifically
        res.status(500).json({
            success: false,
            error: error.error || "Execution failed",
            type: error.type || "Unknown Error"
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Compiler server is listening on port ${PORT}`);
});
