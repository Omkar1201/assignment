import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "production" ? "https://assignment-hbhe.onrender.com" : "http://127.0.0.1:5000");

async function proxyToPythonBackend(req: NextRequest, pathStr: string, method: string) {
  const urlObj = new URL(req.url);
  const queryString = urlObj.search;
  const targetUrl = `${PYTHON_BACKEND_URL}/api/${pathStr}${queryString}`;

  try {
    let bodyData: any = undefined;
    if (method !== "GET" && method !== "HEAD") {
      bodyData = await req.text().catch(() => undefined);
    }

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host" && key.toLowerCase() !== "content-length") {
        headers[key] = value;
      }
    });
    if (!headers["content-type"] && method !== "GET") {
      headers["content-type"] = "application/json";
    }

    const pyRes = await fetch(targetUrl, {
      method,
      headers,
      body: bodyData,
      cache: "no-store",
    });

    const responseText = await pyRes.text();
    let responseJson: any;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { text: responseText };
    }

    return NextResponse.json(responseJson, { status: pyRes.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Python Backend Server Offline",
        message: `Failed to connect to Python Backend at ${PYTHON_BACKEND_URL}. Please start the Python backend server (cd backend && python main.py). Error: ${err.message}`,
      },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = (resolvedParams.path || []).join("/");
  return proxyToPythonBackend(req, pathStr, "GET");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = (resolvedParams.path || []).join("/");
  return proxyToPythonBackend(req, pathStr, "POST");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = (resolvedParams.path || []).join("/");
  return proxyToPythonBackend(req, pathStr, "PUT");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = (resolvedParams.path || []).join("/");
  return proxyToPythonBackend(req, pathStr, "DELETE");
}

export async function OPTIONS() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
