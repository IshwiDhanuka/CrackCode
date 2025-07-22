const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'codes');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

// Creates a temporary file with user's code content
const generateFile = async (format, content, options = {}) => {
    const jobID = uuid();
    const filename = `${jobID}.${format}`;
    const filePath = path.join(dirCodes, filename);

    let finalContent = content;
    if (format === 'cpp' && !/int\s+main\s*\(/.test(content)) {
        const { functionName, className, arguments: argList } = options;
        // Default input parsing (can be improved per problem)
        let inputParsing = `string line;\n    vector<int> piles;\n    int h;\n    getline(cin, line);\n    int start = line.find('[');\n    int end = line.find(']');\n    string nums = line.substr(start + 1, end - start - 1);\n    stringstream ss(nums);\n    string num;\n    while (getline(ss, num, ',')) {\n        piles.push_back(stoi(num));\n    }\n    getline(cin, line);\n    h = stoi(line.substr(line.find('=') + 1));`;
        // Build function call
        let callArgs = [];
        if (argList) {
            // Improved extraction of variable names from argument list
            callArgs = argList.split(',').map(s => {
                // Remove default values and trim
                let noDefault = s.split('=')[0].trim();
                // Use regex to match the last word (variable name)
                let match = noDefault.match(/([\w\d_]+)\s*$/);
                if (match) return match[1];
                // Fallback: remove type and symbols, keep last word
                let parts = noDefault.replace(/&|\*/g, '').trim().split(/\s+/);
                return parts[parts.length - 1];
            });
        }
        let callLine = '';
        if (className && className.trim()) {
            callLine = `${className} obj;\n    cout << obj.${functionName}(${callArgs.join(', ')}) << endl;`;
        } else {
            callLine = `cout << ${functionName}(${callArgs.join(', ')}) << endl;`;
        }
        finalContent = `#include <bits/stdc++.h>\nusing namespace std;\n\n${content}\n\nint main() {\n    ${inputParsing}\n    ${callLine}\n    return 0;\n}`;
    }
    await fs.writeFileSync(filePath, finalContent);
    return filePath;
};

module.exports = {
    generateFile,
};