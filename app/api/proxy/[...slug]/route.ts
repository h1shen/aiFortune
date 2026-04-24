import { NextRequest } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function proxy(req: NextRequest, slug: string[]) {
  const path = slug.join("/")
  const search = req.nextUrl.search
  const url = `${BACKEND_URL}/${path}${search}`

  const headers = new Headers()
  const ct = req.headers.get("content-type")
  if (ct) headers.set("content-type", ct)
  const accept = req.headers.get("accept")
  if (accept) headers.set("accept", accept)

  const init: RequestInit = {
    method: req.method,
    headers,
    // @ts-expect-error duplex is required for streaming bodies in Node fetch
    duplex: "half",
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body
  }

  const upstream = await fetch(url, init)

  const respHeaders = new Headers()
  upstream.headers.forEach((v, k) => {
    if (["content-encoding", "transfer-encoding", "connection"].includes(k.toLowerCase())) return
    respHeaders.set(k, v)
  })

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params
  return proxy(req, slug)
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params
  return proxy(req, slug)
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params
  return proxy(req, slug)
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params
  return proxy(req, slug)
}
