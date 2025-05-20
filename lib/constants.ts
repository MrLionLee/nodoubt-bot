export const isProductionEnvironment = process.env.NODE_ENV === 'production';

export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.PLAYWRIGHT ||
  process.env.CI_PLAYWRIGHT,
);


export const mockUser = {
  "email": "guest-1747471637160",
  "id": "4b28dece-18c2-418c-ad7c-05e0c0b9954a",
  "type": "guest"
}