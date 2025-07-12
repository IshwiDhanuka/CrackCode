const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirInputs = path.join(__dirname, "inputs");

if (!fs.existsSync(dirInputs)) {
  fs.mkdirSync(dirInputs);
}

const generateInputFile = async (input = "") => {
  const inputId = uuid();
  const fileName = `${inputId}.txt`;
  const filePath = path.join(dirInputs, fileName);

  await fs.promises.writeFile(filePath, input);

  return filePath;
};

module.exports = { generateInputFile };
