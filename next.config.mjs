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
  // 开发环境：把 /api/* 转发到本地 uvicorn（生产由 Vercel 的 vercel.json 处理）
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return []
    const backend = process.env.BACKEND_URL || "http://127.0.0.1:8000"
    return [
      { source: "/api/bazi/:path*", destination: `${backend}/api/bazi/:path*` },
      { source: "/api/chat/:path*", destination: `${backend}/api/chat/:path*` },
      { source: "/api/health", destination: `${backend}/api/health` },
    ]
  },
}

export default nextConfig
