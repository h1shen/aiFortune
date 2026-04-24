/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 允许同网段设备访问 Next dev HMR（否则手机/局域网访问会阻塞）
  allowedDevOrigins: ["192.168.4.186", "localhost", "127.0.0.1"],
}

export default nextConfig
