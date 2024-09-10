/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('bun:sqlite')
    config.externals.push('bun')
    return config
  },
}

export default nextConfig
