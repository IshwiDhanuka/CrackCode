const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'codes');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

// Detect the type of argument based on the first test case input
function detectType(argName, testcases) {
    if (!testcases || testcases.length === 0) return "int";
    let input = testcases[0].input || "";

    if (input.includes('=')) {
        input = input.split('=')[1].trim();
    }

    if (/^\s*\[\[.*\]\]\s*$/.test(input)) return "vector<vector<int>>";
    if (/^\s*\[.*\]\s*$/.test(input)) return "vector<int>";
    if (/^\d+$/.test(input.trim())) return "int";
    return "string";
}

// Generate input parsing code for each argument
function generateParsing(argList, testcases) {
    let parsingCode = "";
    let callArgs = [];

    if (!Array.isArray(argList)) argList = [argList];

    for (let arg of argList) {
        const argName = arg;
        const argType = detectType(argName, testcases);
        callArgs.push(argName);

        switch (argType) {
            case "int":
                parsingCode += `int ${argName};\n    cin >> ${argName};\n    cin.ignore(numeric_limits<streamsize>::max(), '\\n');\n`;
                break;

            case "string":
                parsingCode += `string ${argName};\n    getline(cin, ${argName});\n`;
                break;

            case "vector<int>":
                parsingCode += `
{
    string line;
    getline(cin, line);
    int start = line.find('[');
    int end = line.find(']');
    string numsStr = line.substr(start + 1, end - start - 1);
    vector<int> ${argName};
    if (!numsStr.empty()) {
        stringstream ss(numsStr);
        string num;
        while (getline(ss, num, ',')) {
            num.erase(remove_if(num.begin(), num.end(), ::isspace), num.end());
            ${argName}.push_back(stoi(num));
        }
    }
}`;
                break;

            case "vector<vector<int>>":
                parsingCode += `
{
    string line;
    getline(cin, line);
    vector<vector<int>> ${argName};
    while (!line.empty()) {
        int i = line.find('[');
        if (i == string::npos) break;
        int j = line.find(']', i);
        string sub = line.substr(i + 1, j - i - 1);
        vector<int> inner;
        if (!sub.empty()) {
            stringstream ss(sub);
            string num;
            while (getline(ss, num, ',')) {
                num.erase(remove_if(num.begin(), num.end(), ::isspace), num.end());
                inner.push_back(stoi(num));
            }
        }
        ${argName}.push_back(inner);
        line = line.substr(j + 1);
    }
}`;
                break;

            default:
                parsingCode += `string ${argName};\n    getline(cin, ${argName});\n`;
        }
    }

    return { parsingCode, callArgs };
}

// Main generateFile function
const generateFile = async (format, content, options = {}) => {
    const jobID = uuid();
    const filename = `${jobID}.${format}`;
    const filePath = path.join(dirCodes, filename);

    let finalContent = content;

    if (format === 'cpp' && !/int\s+main\s*\(/.test(content)) {
        const functionName = options.functionName || '';
        const className = options.className || '';
        let argList = options['arguments'] || [];

        // Remove '&' from arguments for proper declarations
        const cleanArgList = argList.map(arg => arg.replace(/&/g, '').trim());

        const { parsingCode, callArgs } = generateParsing(cleanArgList, options.testcases);

        let callLine = '';
    const returnType = options.returnType ;

    if (className && className.trim()) {
        if (returnType === 'void') {
            callLine = `${className} obj;\n    obj.${functionName}(${callArgs.join(', ')});`;
        } else {
            callLine = `${className} obj;\n    cout << obj.${functionName}(${callArgs.join(', ')}) << endl;`;
        }
    } else {
        if (returnType === 'void') {
            callLine = `${functionName}(${callArgs.join(', ')});`;
        } else {
            callLine = `cout << ${functionName}(${callArgs.join(', ')}) << endl;`;
        }
    }

        finalContent = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <cmath>
#include <algorithm>
#include <climits>
using namespace std;

${content}

int main() {
    ${parsingCode}
    ${callLine}
    return 0;
}`;
    }

    await fs.writeFileSync(filePath, finalContent);
    return filePath;
};

module.exports = {
    generateFile,
};
