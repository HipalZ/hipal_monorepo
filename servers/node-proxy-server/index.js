import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

const services = [
	{
		path: "http://localhost:3001/v1/businesses/:id/testing",
		target: "http://localhost:3001",
	},
	{ path: "/categories", target: "http://localhost:3002" },
	{ path: "/dishes", target: "http://localhost:3003" },
];

services.forEach((service) => {
	app.use(
		service.path,
		createProxyMiddleware({
			target: service.target,
			changeOrigin: true,
			pathRewrite: (path, req) =>
				path.replace(
					service.path,
					"http://localhost:4545/businesses/v1/businesses/:id/testing",
				),
		}),
	);
});

app.get("/businesses/v1/businesses/:id/testing", (req, res) => {
	res.json({
		id: 1,
		name: "Business 1",
	});
});

app.listen(4545, () => {
	console.log("Proxy server listening on port 4545");
});
