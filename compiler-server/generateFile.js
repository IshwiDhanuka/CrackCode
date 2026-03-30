const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Normalizes a type string to a canonical C++ type.
 */
function toCppType(typeStr) {
    const t = (typeStr || '').trim().toLowerCase().replace(/\s+/g, '');
    const map = {
        'int':                  'int',
        'long':                 'long long',
        'longlong':             'long long',
        'long long':            'long long',
        'double':               'double',
        'float':                'float',
        'bool':                 'bool',
        'string':               'string',
        'vector<int>':          'vector<int>',
        'vector<int>&':         'vector<int>',
        'vector<long>':         'vector<long long>',
        'vector<longlong>':     'vector<long long>',
        'vector<double>':       'vector<double>',
        'vector<string>':       'vector<string>',
        'vector<bool>':         'vector<bool>',
        'vector<vector<int>>':  'vector<vector<int>>',
        'void':                 'void',
    };
    // Strip reference/const qualifiers for lookup
    const stripped = t.replace(/&$/, '').replace(/^const/, '').trim();
    return map[stripped] || stripped;
}

/**
 * Generates C++ stdin-reader code for a given type.
 * Variable is named `varName`.
 */
function genReader(cppType, varName) {
    const t = cppType.trim();

    if (['int', 'long long', 'double', 'float'].includes(t)) {
        return `    ${t} ${varName};\n    cin >> ${varName};`;
    }
    if (t === 'bool') {
        // Accept 0/1 or true/false
        return `    int _b_${varName}; cin >> _b_${varName}; bool ${varName} = (_b_${varName} != 0);`;
    }
    if (t === 'string') {
        return `    string ${varName};\n    cin >> ${varName};`;
    }
    if (t === 'vector<int>' || t === 'vector<long long>' || t === 'vector<double>' || t === 'vector<string>' || t === 'vector<bool>') {
        const inner = t.replace('vector<', '').replace('>', '');
        const boolRead = inner === 'bool'
            ? `    for(int _i=0;_i<_n_${varName};_i++){int _b;cin>>_b;${varName}[_i]=(_b!=0);}`
            : `    for(int _i=0;_i<_n_${varName};_i++) cin >> ${varName}[_i];`;
        return `    int _n_${varName}; cin >> _n_${varName};\n    ${t} ${varName}(_n_${varName});\n${boolRead}`;
    }
    if (t === 'vector<vector<int>>') {
        return `    int _r_${varName}, _c_${varName}; cin >> _r_${varName} >> _c_${varName};\n    vector<vector<int>> ${varName}(_r_${varName}, vector<int>(_c_${varName}));\n    for(int _i=0;_i<_r_${varName};_i++) for(int _j=0;_j<_c_${varName};_j++) cin >> ${varName}[_i][_j];`;
    }
    // Fallback
    return `    ${t} ${varName};\n    cin >> ${varName};`;
}

/**
 * Generates C++ stdout-printer code for a given return type.
 */
function genPrinter(cppReturnType, resultVar) {
    const t = cppReturnType.trim();
    if (t === 'void') return '';
    if (t === 'vector<vector<int>>') {
        return `    for(auto& _row : ${resultVar}) { for(size_t _i=0;_i<_row.size();_i++) { if(_i) cout<<" "; cout<<_row[_i]; } cout<<"\\n"; }`;
    }
    if (t.startsWith('vector<')) {
        return `    for(size_t _i=0;_i<${resultVar}.size();_i++) { if(_i) cout<<" "; cout<<${resultVar}[_i]; } cout<<endl;`;
    }
    if (t === 'bool') {
        return `    cout << (${resultVar} ? "true" : "false") << endl;`;
    }
    return `    cout << ${resultVar} << endl;`;
}

/**
 * Parses argument types from the DB `arguments` string.
 *
 * DB stores it in two formats depending on how admin entered it:
 *   Format A (type-only, comma-separated):  "vector<int>,int"
 *   Format B (C++ style with names):        "vector<int>& nums, int target"
 *
 * This function handles both and returns an array of clean C++ type strings.
 */
function parseArgumentTypes(argsStr) {
    if (!argsStr || !argsStr.trim()) return [];

    // Detect Format B: contains a space after a type (e.g. "vector<int>& nums")
    // Strategy: split on commas that are NOT inside angle brackets
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of argsStr) {
        if (ch === '<') depth++;
        else if (ch === '>') depth--;
        else if (ch === ',' && depth === 0) {
            parts.push(current.trim());
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim()) parts.push(current.trim());

    return parts.map(part => {
        // If the part has a space (and is not just a type like "long long"),
        // it's "type name" format — take everything before the last word
        const normalized = part.replace(/\s+/g, ' ').trim();
        // Check if it ends with an identifier (variable name)
        const match = normalized.match(/^(.+?)\s+[a-zA-Z_]\w*\s*$/);
        if (match) {
            return toCppType(match[1].trim());
        }
        return toCppType(normalized);
    });
}

/**
 * Builds a complete C++ file with a dynamic main() driver.
 *
 * @param {string} language       - 'cpp'
 * @param {string} content        - User's class/function code
 * @param {object} options
 *   @param {string} functionName
 *   @param {string} className
 *   @param {string} argumentTypes - Raw arguments string from DB
 *   @param {string} returnType
 */
const generateFile = async (language, content, options = {}) => {
    const jobId = uuid();
    const fileName = `${jobId}.cpp`;
    const filePath = path.join(dirCodes, fileName);

    const { functionName, className, argumentTypes, returnType } = options;

    if (typeof functionName !== 'string' || functionName.trim() === '') {
        throw new Error('generateFile failed: invalid functionName supplied');
    }

    const argTypeList = parseArgumentTypes(argumentTypes);
    const cppReturnType = toCppType(returnType || 'void');
    const argVarNames = argTypeList.map((_, i) => `arg${i}`);

    // Build reader lines
    const readerLines = argTypeList.map((t, i) =>
        genReader(t, argVarNames[i])
    ).join('\n');

    // Build function call
    const callArgs = argVarNames.join(', ');
    let callLine;
    if (cppReturnType === 'void') {
        callLine = `    ${className || 'Solution'} obj;\n    obj.${functionName}(${callArgs});`;
    } else {
        callLine = `    ${className || 'Solution'} obj;\n    ${cppReturnType} result = obj.${functionName}(${callArgs});`;
    }

    // Build printer
    const printerLine = cppReturnType === 'void' ? '' : genPrinter(cppReturnType, 'result');

    const driver = `
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
${readerLines}
${callLine}
${printerLine}
    return 0;
}`;

    const finalContent = `#include <bits/stdc++.h>
using namespace std;

${content}

${driver}`;

    fs.writeFileSync(filePath, finalContent);
    return filePath;
};

module.exports = { generateFile };