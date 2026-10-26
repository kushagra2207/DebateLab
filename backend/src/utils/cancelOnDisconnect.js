export function cancelOnDisconnect(req, res) {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) {
      console.log(`[request] client disconnected: ${req.method} ${req.originalUrl}`);
      controller.abort();
    }
  });
  return controller.signal;
}