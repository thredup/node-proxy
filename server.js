const httpProxy = require('http-proxy');

const TARGET_HOST = process.env.TARGET_HOST || "http://127.0.0.1";
const TARGET_PORT = process.env.TARGET_PORT || 8000
const LISTEN_PORT = process.env.LISTEN_PORT || 3000
const GRAB_REQ_BODY = process.env.GRAB_REQ_BODY || false;

var proxy = httpProxy.createProxyServer({
  target:`${TARGET_HOST}:${TARGET_PORT}`
}).listen(LISTEN_PORT);

if (GRAB_REQ_BODY) {
  proxy.on('proxyReq', (proxyReq, req, res, options) => {

    let body = ""
    req.on("data", data => body += data)
    req.on("end", () => {
      req.body = body
    })

  });
}

proxy.on('proxyRes', (proxyRes, req, res) => {

  if (proxyRes.statusCode >= 500) {

    console.log(JSON.stringify({
      res_statusCode: proxyRes.statusCode,
      res_statusMessage: proxyRes.statusMessage,
      res_headers: proxyRes.headers,
      req_headers: req.headers,
      req_url: req.url,
      req_method: req.method,
      req_body: req.body
    }))
  }

  proxyRes.pipe(res)

}); 