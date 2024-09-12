/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.externals.push('bun:sqlite')
    config.externals.push('bun')
    return config
  },
}

export default nextConfig
