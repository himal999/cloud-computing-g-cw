const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:5000',
  },
}
module.exports = nextConfig
