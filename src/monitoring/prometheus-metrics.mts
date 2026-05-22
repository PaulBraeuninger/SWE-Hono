// https://medium.com/@tiffanyadisuryo/setting-up-a-prometheus-and-grafana-monitoring-system-for-my-bun-js-backend-243c4c3cd29d

import { type Context, type Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

// Configure Prometheus metrics with default data.
collectDefaultMetrics();

// Metric: total number of HTTP requests.
const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code'],
});

// Metric: histogram for HTTP request duration.
const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

/**
 * Hono middleware that collects Prometheus metrics for incoming requests.
 */
// https://hono.dev/docs/guides/middleware
export const trackMetrics = createMiddleware(async (c: Context, next: Next) => {
    const start = Date.now();
    const { path, method } = c.req;

    await next();

    const { res } = c;
    const { status } = res;
    const duration = (Date.now() - start) / 1000;

    httpRequestsTotal.inc({ method, path, status_code: status });
    httpRequestDurationSeconds.observe(
        { method, path, status_code: status },
        duration,
    );
});
