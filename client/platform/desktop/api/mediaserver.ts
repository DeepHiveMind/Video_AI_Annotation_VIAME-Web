import pump from 'pump';
import rangeParser from 'range-parser';
import request from 'request';
import http from 'http';

/**
 * Implement an HTTP server within the client render
 * process to serve bytes from disk.
 */
const server = http.createServer((req, resp) => {
  const range = req.headers.range && rangeParser()
});
