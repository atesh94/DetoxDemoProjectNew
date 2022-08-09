describe('Foo', () => {
  beforeAll(() => {
    console.log('prepare to be foo before everything, should be ignored');
  });

  it('should be foo', () => {
    expect('foo').toBe('foo');
  });

  afterAll(() => {
    console.log('clean up after all');
  });
});

describe('Bar', () => {
  beforeEach(() => {
    console.log('prepare to be bar');
  });

  it('should be bar', () => {
    expect('bar').toBe('bar');
  });
});

describe('Baz', () => {
  beforeEach(() => {
    console.log('prepare to be baz');
  });

  it('should be baz', () => {
    expect('baz').toBe('baz');
  });

  afterEach(() => {
    console.log('you are baz');
  });

  describe('Qux', () => {
    it('should be baz qux', () => {
      expect('baz qux').toBe('baz qux');
    });

    afterEach(() => {
      console.log('you are baz qux');
    });
  });

  afterAll(() => {
    console.log('clean up after all');
  });
});
