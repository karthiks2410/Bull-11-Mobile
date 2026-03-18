module.exports = {
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  })),
  Stack: {
    Screen: jest.fn(({ children }) => children),
  },
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => []),
};
