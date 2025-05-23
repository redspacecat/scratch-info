async function main() {
    const path = require("path");
    const api = require("./api.js");

    // Require the fastify framework and instantiate it
    const fastify = require("fastify")({
      ignoreTrailingSlash: true
    });
    await fastify.register(import("@fastify/rate-limit"), { global: true, max: 30, timeWindow: 60 * 1000 });

    // Setup our static files
    fastify.register(require("@fastify/static"), {
        root: path.join(__dirname, "public"),
        prefix: "/", // optional: default '/'
    });

    // point-of-view is a templating manager for fastify
    fastify.register(require("@fastify/view"), {
        engine: {
            handlebars: require("handlebars"),
        },
    });

    fastify.all("/api/followering/:username", api.followering);
    fastify.all("/api/projectStats/:username", api.projectStats);
    fastify.all("/api/userInfo/:username", api.getUserInfo);
    fastify.all("/api/browserHistory/:username", api.browserHistory);
    fastify.all("/api/projectInfo/:id", api.apiProjectData);
  
    fastify.all("/users/:username", api.getUser);
    fastify.all("/users/:username/browserHistory", { config: { rateLimit: { max: 4, timeWindow: 15000 } } }, api.browserHistoryPage);
    fastify.all("/projects/:project", api.projectPage)

    fastify.all("/", async function (request, reply) {
        return reply.view("/src/pages/main.html");
    });

    // Run the server and report out to the logs
    fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, function (err, address) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Your app is listening on ${address}`);
    });
}
main();
