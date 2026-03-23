const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (language, content, options = {}) => {
    const jobId = uuid();
    const fileName = `${jobId}.cpp`;
    const filePath = path.join(dirCodes, fileName);

    const { functionName, className } = options;

    // Use a clean driver that only uses variable names, not types or strings
 const driver = `
int main() {
    ${className} obj;
    int n;
    // 1. Read the size of the vector
    if (!(cin >> n)) return 0;

    // 2. Read the vector elements
    vector<int> piles(n);
    for(int i = 0; i < n; i++) {
        if(!(cin >> piles[i])) break;
    }

    // 3. Read the second integer (h)
    int h;
    if (cin >> h) {
        // Call with BOTH arguments
        cout << obj.${functionName}(piles, h) << endl;
    } else {
        // This part was causing the error because it didn't match your function signature
        // We will just return an error or handle 1-arg functions specifically if needed
        return 1; 
    }
    return 0;
}`;

    const finalContent = `#include <bits/stdc++.h>
using namespace std;

${content}

${driver}`;

    fs.writeFileSync(filePath, finalContent);
    return filePath;
};

module.exports = { generateFile }; // Exported as an object property