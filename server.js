const httpProxy = require('http-proxy');

const TARGET_HOST = process.env.TARGET_HOST || "http://127.0.0.1";
const TARGET_PORT = process.env.TARGET_PORT || 8000
const LISTEN_PORT = process.env.LISTEN_PORT || 3000
const GRAB_REQUEST_BODY = process.env.GRAB_REQUEST_BODY || false;
const GRAB_RESPONSE_BODY = process.env.GRAB_RESPONSE_BODY || false;
const STATUS_CODE_LEVEL = +process.env.STATUS_CODE_LEVEL || 500

var proxy = httpProxy.createProxyServer({
  target:`${TARGET_HOST}:${TARGET_PORT}`
}).listen(LISTEN_PORT);

if (GRAB_REQUEST_BODY) {
  proxy.on('proxyReq', (proxyReq, req, res, options) => {

    let body = ""
    req.on("data", data => body += data)
    req.on("end", () => {
      req.body = body
    })

  });
}

proxy.on('proxyRes', (proxyRes, req, res) => {

  if (proxyRes.statusCode >= STATUS_CODE_LEVEL) {

      let resultLoggingObj = {
        res_statusCode: proxyRes.statusCode,
        res_statusMessage: proxyRes.statusMessage,
        res_headers: proxyRes.headers,
        req_headers: req.headers,
        req_url: req.url,
        req_method: req.method,
        req_body: req.body
      }


    if (GRAB_RESPONSE_BODY) {
      let body = new Buffer('');
        proxyRes.on('data', function (data) {
            body = Buffer.concat([body, data]);
        });
        proxyRes.on('end', function () {
            body = body.toString();
            resultLoggingObj.res_body = body
            console.log(JSON.stringify(resultLoggingObj))
        });
    } else {
      console.log(JSON.stringify(resultLoggingObj))
    }

    
  }

  proxyRes.pipe(res)

}); 