const fs = require('fs');

const _filePathToTestToCodeMap = {};

const getCodeForTest = async (filePath, fullTestName) => {
 console.assert(filePath !== undefined, 'filePath cannot be undefined');
 console.assert(fullTestName !== undefined, 'fullTestName cannot be undefined');

 if(!_filePathToTestToCodeMap[filePath]) {
  _filePathToTestToCodeMap[filePath] = await _parseFile(filePath);
 }

 const code = _filePathToTestToCodeMap[filePath][fullTestName];
 console.assert(code !== undefined, `Could not find code for test ${fullTestName} in file ${filePath}`);

 return code;
};

const _parseFile = async (filePath) => {
 await fs.readFile(filePath, 'utf8', (err, data) => {
  if(err) {
   throw err;
  }

  return _parseFileContents(data);
 });
};

const _parseFileContents = (data) => {
 const code = data.split('\n');
 const codeHierarchy = _recursivelyParseContents(code);
 return testNameToCode(codeHierarchy);
};

const _recursivelyParseContents = (describeBlock) => {
 return {
  beforeEach: findBeforeEach(describeBlock),
  tests: findTests(describeBlock),
  describes: findDescribes(describeBlock),
  afterEach: findAfterEach(describeBlock),
 };
};

const findBeforeEach = (describeBlock) => {
 const beforeEach = describeBlock.find(line => line.includes('beforeEach'));
 return beforeEach ? beforeEach.split(' ')[1] : undefined;
};

const findAfterEach = (describeBlock) => {
 const afterEach = describeBlock.find(line => line.includes('afterEach'));
 return afterEach ? afterEach.split(' ')[1] : undefined;
};

const findTests = (describeBlock) => {

};

const findDescribes = (describeBlock) => {

};

const testNameToCode = (codeHierarchy) => {
 const testNameToCode = {};
 const testNames = Object.keys(codeHierarchy.tests);
 for(let i = 0; i < testNames.length; i++) {
  const testName = testNames[i];
  const code = codeHierarchy.tests[testName];
  testNameToCode[testName] = code;
 }
 return testNameToCode;
};


module.exports = getCodeForTest;
