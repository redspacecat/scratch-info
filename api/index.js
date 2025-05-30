const path = require("path");
const api = require("../api.js");
const fs = require("fs");
import { put } from '@vercel/blob'
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

    fastify.get("/api/v1/users/:username/followering", api.followering); // deprecated
    fastify.get("/api/v1/users/:username/projectStats", api.projectStats);
    fastify.get("/api/v1/users/:username/info", api.getUserInfo);
    fastify.get("/api/v1/users/griffpatch/followerCount", api.rateLimit(3, 60000), api.griffpatchFollowerCount);
    fastify.get("/api/v1/users/:username/browserHistory", api.browserHistory);
    fastify.get("/api/v1/projects/:id/info", api.apiProjectData);
    fastify.get("/api/v1/projects/random", api.rateLimit(5, 60000), api.randomProject);
    fastify.get("/api/v1/users/random", api.rateLimit(5, 60000), api.randomUser);

    fastify.get("/", api.page("main"));
    fastify.get("/users/:username", api.getUser);
    fastify.get("/users/:username/browserHistory", api.rateLimit(5, 60000), api.browserHistoryPage);
    fastify.get("/projects/:project", api.projectPage);
    fastify.get("/about", api.page("about"));
    fastify.get("/api/docs", api.page("apiDocs"));

    fastify.setNotFoundHandler(api.page("404"))
    // fastify.all("/test", async function (request, reply) {
    //     const data = {}
    //     const blob = await put("usernames.txt", usernameData, {
    //         access: 'public',
    //         allowOverwrite: true
    //     });
    //     reply.code(200).send("ok")
    // });

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
