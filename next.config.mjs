/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXTAUTH_URL: 'http://localhost:3000',
  },
  compiler: {
    // Remove all console logs
    removeConsole: false,
  },
};

export default nextConfig;

//   env: { NEXTAUTH_URL: 'https://calm-grass-0da537b1e.5.azurestaticapps.net' },
