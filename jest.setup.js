import "@testing-library/jest-dom";

// Mock Cloudflare context
jest.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: jest.fn(() => ({
    env: {
      YUMEMI_API_KEY: "test-api-key",
      POPULATION_CACHE: {
        get: jest.fn(),
        put: jest.fn(),
        list: jest.fn(),
      },
    },
    cf: {},
    ctx: {
      waitUntil: jest.fn(),
      passThroughOnException: jest.fn(),
    },
  })),
  initOpenNextCloudflareForDev: jest.fn(() => Promise.resolve()),
}));
