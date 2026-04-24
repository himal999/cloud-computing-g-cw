/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BFF_URL: 'http://4.188.102.12',
  },
}
module.exports = nextConfig