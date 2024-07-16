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
  const timestamp = getUTCTimestamp();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  if (logFile) {
    fs.appendFileSync(logFile, logMessage + '\n');
  }
}

// Logging middleware
app.use((req, res, next) => {
  log(`Request: ${req.method} ${req.url}`);
  
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = function (chunk) {
    chunks.push(chunk);
    return oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    log(`Response: ${res.statusCode}`);
    log(body);
    oldEnd.apply(res, arguments);
  };

  next();
});

// Proxy middleware
app.use('/', createProxyMiddleware({
  target: targetUrl,
  changeOrigin: true,
}));

app.listen(proxyPort, () => {
  log(`Proxy server is running on port ${proxyPort}`);
  log(`Proxying requests to ${targetUrl}`);
  if (logFile) {
    log(`Logging to file: ${logFile}`);
  }
});