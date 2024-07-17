#!/usr/bin/env node

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');

const args = process.argv.slice(2);
const targetUrl = args[0];
let proxyPort = 8082;
let logFile = null;

// Parse command line arguments
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--port') {
    proxyPort = parseInt(args[++i]);
  } else if (args[i] === '--log-file') {
    logFile = args[++i];
  }
}

if (!targetUrl) {
  console.error('Usage: node proxy.js <target-url> [--port <port>] [--log-file <file>]');
  process.exit(1);
}

const app = express();

// Function to get current UTC timestamp
function getUTCTimestamp() {
  return new Date().toISOString();
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  if (logFile) {
    fs.appendFileSync(logFile, logMessage + '\n');
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  log(`Request: ${req.method} ${req.url}`);
  
  // Log request headers
  log(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  // Log request payload
  if (req.body && Object.keys(req.body).length > 0) {
    log(`Request Payload: ${JSON.stringify(req.body, null, 2)}`);
  }

  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = function (chunk) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    return oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    log(`Response: ${res.statusCode}`);
    log(`Response Headers: ${JSON.stringify(res.getHeaders(), null, 2)}`);
    log(`Response Body: ${body}`);
    oldEnd.apply(res, arguments);
  };

  next();
});

// Proxy middleware
const proxy = createProxyMiddleware({
  target: targetUrl,
  changeOrigin: true,
  onError: (err, req, res) => {
    log(`Proxy Error: ${err.message}`);
    log(`Error details: ${JSON.stringify(err)}`);
    log(`Failed request: ${req.method} ${req.url}`);
    if (err.code) {
      log(`Error code: ${err.code}`);
    }
    if (err.syscall) {
      log(`System call: ${err.syscall}`);
    }
    res.writeHead(502, {
      'Content-Type': 'text/plain',
    });
    res.end(`Proxy Error: ${err.message}`);
  },
  onProxyReq: (proxyReq, req, res) => {
    log(`Proxying request to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    log(`Received response from upstream: ${proxyRes.statusCode}`);
  }
});

app.use('/', proxy);

// Error handling middleware
app.use((err, req, res, next) => {
  log(`Express Error: ${err.message}`);
  log(`Error stack: ${err.stack}`);
  res.status(500).send('Internal Server Error');
});

app.listen(proxyPort, () => {
  log(`Proxy server is running on port ${proxyPort}`);
  log(`Proxying requests to ${targetUrl}`);
  if (logFile) {
    log(`Logging to file: ${logFile}`);
  }
});