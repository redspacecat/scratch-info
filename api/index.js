const path = require("path");
const api = require("../api.js");
const fs = require("fs");
// import { inject } from '@vercel/analytics';
// const inject = require("@vercel/analytics")
// inject()

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
    ignoreTrailingSlash: true,
});
async function main() {
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
        root: path.join(__dirname, "views"),
    });

    fastify.all("/api/v1/users/:username/followering", api.followering);
    fastify.all("/api/v1/users/:username/projectStats", api.projectStats);
    fastify.all("/api/v1/users/:username/info", api.getUserInfo);
    fastify.all("/api/v1/users/:username/browserHistory", api.browserHistory);
    fastify.all("/api/v1/projects/:id/projectInfo", api.apiProjectData);

    fastify.all("/users/:username", api.getUser);
    fastify.all("/users/:username/browserHistory", { config: { rateLimit: { max: 4, timeWindow: 15000 } } }, api.browserHistoryPage);
    fastify.all("/projects/:project", api.projectPage);

    const navbarCode = fs.readFileSync(path.join(__dirname, "navbar.txt"), "utf8");
    fastify.all("/", async function (request, reply) {
        let params = {};
        params.nav = navbarCode;
        return reply.view("/main.hbs", params);
    });
    fastify.all("/about", async function (request, reply) {
        let params = {};
        params.nav = navbarCode;
        return reply.view("/about.hbs", params);
    });

    // Run the server and report out to the logs
    fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, function (err, address) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Your app is listening on ${address}`);
    });
    // module.exports = fastify
}
main();
export default async function handler(req, res) {
    await fastify.ready();
    fastify.server.emit("request", req, res);
}

// import Fastify from 'fastify'

// const app = Fastify({
//   logger: true,
// })

// app.get('/', async (req, res) => {
//   return res.status(200).type('text/html').send("<p>Hello world</p>")
// })

// export default async function handler(req, res) {
//   await app.ready()
//   app.server.emit('request', req, res)
// }
