const path = require('path');

const getCodeForTest = require('./getCodeForTest');
const mockTestFilePath = path.join(__dirname, '/__mocks__/mockTestFile.js');

describe('getCodeForTest', () =>  {
  it('should return the code for test with before all and after all', async () =>  {
    const code = await getCodeForTest(mockTestFilePath, 'Foo should be foo');

    expect(code).toEqual({ it: 'expect(\'foo\').toBe(\'foo\');' });
  });

  it('should return the code for test with before each block', async () =>  {
    const code = await getCodeForTest(mockTestFilePath, 'Bar should be bar');

    expect(code).toEqual({
      beforeEach: 'console.log(\'prepare to be bar\');',
      it: 'expect(\'bar\').toBe(\'bar\');'
    });
  });

  it('should return the code for test with after each block', async () =>  {
    const code = await getCodeForTest(mockTestFilePath, 'Baz should be baz');

    expect(code).toEqual({
      beforeEach: 'console.log(\'prepare to be baz\');',
      it: 'expect(\'baz\').toBe(\'baz\');',
      afterEach: 'console.log(\'baz is baz\');',
    });
  });

  it('should return the code for nested describe test', async () =>  {
    const code = await getCodeForTest(mockTestFilePath, 'Baz Qux should be baz qux');

    expect(code).toEqual({
      beforeEach: 'console.log(\'prepare to be baz\');',
      describes: {
        it: 'expect(\'baz qux\').toBe(\'baz qux\');',
        afterEach: 'console.log(\'baz qux is baz qux\');',
      },
      afterEach: 'console.log(\'baz is baz\');',
    });
  });

  describe('assertions', () => {
    it('should assert when test is not found in file', async () =>  {
      await expectToThrow(() => getCodeForTest(mockTestFilePath, 'Nothing should be nothing'));
    });

    it('should assert when file is not found', async () =>  {
      await expectToThrow(() => getCodeForTest('invalidTestFile.js', 'Nothing should be nothing'));
    });
  });
});

async function expectToThrow(func) {
  try {
    await func();
    fail('should throw');
  } catch (ex) {
    expect(ex).toBeDefined();
  }
}
