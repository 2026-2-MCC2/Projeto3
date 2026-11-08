import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const dist = resolve("dist");
const index = resolve(dist, "index.html");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad Request");
    return;
  }

  let file = resolve(dist, `.${pathname}`);
  if (file !== dist && !file.startsWith(`${dist}${sep}`)) {
    res.writeHead(400).end("Bad Request");
    return;
  }

  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
  } catch (err) {
    if (err.code !== "ENOENT" && err.code !== "ENOTDIR") {
      console.error(err);
      res.writeHead(500).end("Internal Server Error");
      return;
    }
    if (extname(file)) {
      res.writeHead(404).end("Not Found");
      return;
    }
    file = index;
  }

  res.setHeader("Content-Type", mimeTypes[extname(file)] || "application/octet-stream");
  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = createReadStream(file);
  stream.on("error", (err) => {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500).end("Internal Server Error");
    } else {
      res.destroy(err);
    }
  });
  stream.pipe(res);
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, "0.0.0.0", () => console.log(`Front-end rodando na porta ${port}`));
