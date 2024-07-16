# tapreq

A simple, fast HTTP proxy that logs requests and responses. Perfect for debugging and monitoring HTTP traffic.

## Features

- Easy to use CLI interface
- Proxies HTTP requests to a specified target
- Logs all requests and responses
- Option to save logs to a file
- Includes UTC timestamps for all log entries

## Installation

You can use `tapreq` without installation via `npx`, or install it globally:

```bash
npm install -g tapreq
```

## Usage

### Using npx (no installation required):

```bash
npx tapreq <target-url> [--port <port>] [--log-file <file>]
```

### If installed globally:

```bash
tapreq <target-url> [--port <port>] [--log-file <file>]
```

### Arguments:

- `<target-url>`: The URL to proxy requests to (required)
- `--port <port>`: The port to run the proxy server on (default: 8082)
- `--log-file <file>`: File to write logs to (optional)

## Examples

Proxy requests to http://localhost:3000 and log to console:

```bash
npx tapreq http://localhost:3000
```

Proxy requests to https://api.example.com on port 8000 and log to a file:

```bash
npx tapreq https://api.example.com --port 8000 --log-file proxy.log
```

## Log Format

Logs include UTC timestamps and are formatted as follows:

```
[<UTC Timestamp>] Request: <METHOD> <URL>
[<UTC Timestamp>] Response: <STATUS CODE>
[<UTC Timestamp>] <RESPONSE BODY>
```

## Use Cases

- Debugging API requests and responses
- Monitoring HTTP traffic
- Testing webhooks
- Educational purposes to understand HTTP requests

## License

MIT

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/soorajshankar/tapreq/issues).


## Support

If you found this project helpful, please give it a ⭐️!