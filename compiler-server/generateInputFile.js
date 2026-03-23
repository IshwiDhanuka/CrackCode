const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirInputs = path.join(__dirname, "inputs");

// Added recursive: true to prevent errors if parent folders don't exist
if (!fs.existsSync(dirInputs)) {
  fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = async (input = "") => {
  const inputId = uuid();
  const fileName = `${inputId}.txt`;
  const filePath = path.join(dirInputs, fileName);

  // Ensure input is a string (important if DB returns a number or null)
  const data = String(input);

  await fs.promises.writeFile(filePath, data);

  return filePath;
};

module.exports = { generateInputFile }