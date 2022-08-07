describe('Foo', () => {
  it('should be foo', () => {
    expect('foo').toBe('foo');
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
});
