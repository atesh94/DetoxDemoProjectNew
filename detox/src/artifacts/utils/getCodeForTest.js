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

const _parseFile = (filePath) => {
 const data = fs.readFileSync(filePath, 'utf8');
 return _parseFileContents(data);
};

const _parseFileContents = (data) => {
 const code = data.split('\n');
 const nestedBlocks = _nestedBlocks(code);
 return _testNameToCode(nestedBlocks);
};

const _nestedBlocks = (codeLines) => {
 const blockStartRegex = /^\s*[A-Za-z]+\s*\([A-Za-z\s',]*\(\s*\)\s*=\s*>\s*{$/gms;
 const blockEndRegex = /^\s*}\s*\);$/gms;

 const head = {
  parent: undefined,
  children: [],
  code: [],
 };

 let current = head;

 for (const line of codeLines) {
  current.code.push(line);

  if (line.match(blockStartRegex)) {
   const length = current.children.push({
    parent: current,
    children: [],
    code: [],
   });
   current = current.children[length - 1];
  } else if(line.match(blockEndRegex)) {
   current = current.parent;
  }
 }

 return head;
};

const _testNameToCode = (nestedBlocks) => {
 return _recursiveTestNameToCode([], '', nestedBlocks);
};

const _recursiveTestNameToCode = (testNameToCode, suiteName, nestedBlocks) => {
 const beforeEaches = [];
 const afterEaches = [];

 for (const child of nestedBlocks.children) {
  const blockType = _blockType(child.code[0]);
  switch (blockType) {
  case 'it': {
   const testName = `${suiteName} ${_blockName(child.code[0])}`;
   testNameToCode[testName] = {
    code: child.code.join('\n'),
    beforeEaches: [],
    afterEaches: []
   };
   break;
  }

  case 'beforeEach': {
   const code = child.code.join('\n');
   beforeEaches.push(code);
   break;
  }

  case 'afterEach': {
   const code = child.code.join('\n');
   afterEaches.push(code);
   break;
  }

  case 'describe': {
   const suiteName = _blockName(child.code[0]);
   testNameToCode.push(_recursiveTestNameToCode({ ...testNameToCode }, suiteName, child));
   break;
  }

  default: {}
  }
 }

 for (const key of Object.keys(testNameToCode)) {
  testNameToCode[key].beforeEaches.push(beforeEaches);
  testNameToCode[key].afterEaches.push(afterEaches);
 }

 return testNameToCode;
};

const _blockType = (code) => {
 return code.split('(')[0].trim();
};

const _blockName = (code) => {
 return code.match(/\(([^)]+),/)[1].trim();
};

module.exports = getCodeForTest;
