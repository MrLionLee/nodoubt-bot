export const isProductionEnvironment = process.env.NODE_ENV === 'production';

export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.PLAYWRIGHT ||
  process.env.CI_PLAYWRIGHT,
);


export const mockUser = {
  "email": "test-user@gmail.com",
  "id": "447e1a55d-55b5-4aa7-a653-0bcb56f03365",
  "type": "guest"
}