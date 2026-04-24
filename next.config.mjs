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
  // 开发环境：把 /api/* 转发到本地 uvicorn
  // 生产环境（Vercel）：由 vercel.json 的 rewrites 把 /api/* 路由到 Python serverless function
  // 判定依据：Vercel 在 build/runtime 都会注入 VERCEL=1；本地没有
  async rewrites() {
    if (process.env.VERCEL === "1") return []
    const backend = process.env.BACKEND_URL || "http://127.0.0.1:8000"
    return [
      { source: "/api/bazi/:path*", destination: `${backend}/api/bazi/:path*` },
      { source: "/api/chat/:path*", destination: `${backend}/api/chat/:path*` },
      { source: "/api/health", destination: `${backend}/api/health` },
    ]
  },
}

export default nextConfig
