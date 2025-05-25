const fetch = require("node-fetch");
const uap = require("ua-parser-js");
const HTMLParser = require("node-html-parser");
const path = require("path")
const fs = require("fs");
const navbarCode = fs.readFileSync(path.join(__dirname, "api", "navbar.txt"), "utf8");
// const Database = require("easy-json-database");
// const projectDB = new Database("./user-project-database.json", {
//     snapshots: {
//         enabled: false,
//     },
// });
// const projectInfoDB = new Database("./project-database.json", {
//     snapshots: {
//         enabled: false,
//     },
// });

let api = {};

async function fetch2(url) {
    let proxyURL = 'https://corsproxy.josueart40.workers.dev/?'
    if (url.startsWith("https://api.scratch.mit.edu")) {
        return await fetch(proxyURL + encodeURIComponent(url))
    } else {
        return await fetch(url)
    }
}


api.followering = async function (request, reply) {
    let data = {
        followers: "?",
        following: "?",
    };

    let user = request.params.username;
    if (user.endsWith("*")) {
        user = user.slice(0, user.length - 1);
    }
    try {
        // Get followers/following
        let followingHTML = await (await fetch2(`https://scratch.mit.edu/users/${user}/following`)).text();
        let followersHTML = await (await fetch2(`https://scratch.mit.edu/users/${user}/followers`)).text();

        let root, text;

        root = HTMLParser.parse(followingHTML);
        text = root.querySelector(".box-head h2").childNodes[1].textContent;
        // let dom1 = new JSDOM(followingHTML);
        // let text = dom1.window.document.querySelector(".box-head h2").textContent;
        data.following = text.slice(text.indexOf("(") + 1, text.indexOf(")"));

        root = HTMLParser.parse(followersHTML);
        text = root.querySelector(".box-head h2").childNodes[1].textContent;
        // let dom2 = new JSDOM(followersHTML);
        // let text2 = dom2.window.document.querySelector(".box-head h2").textContent;
        data.followers = text.slice(text.indexOf("(") + 1, text.indexOf(")"));
    } catch {}
  
    reply.headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    })
    reply.code(200).header("Content-Type", "application/json; charset=utf-8").send(JSON.stringify(data, null, 4));
};

async function getStats(username) {
    let user = username;

    let data = {
        totalViews: "?",
        totalLoves: "?",
        totalFaves: "?",
        loveToViewRatio: "?",
        averageStats: {
            averageViews: "?",
            averageLoves: "?",
            averageFaves: "?",
        },
    };
    let page = 0;
    let projects = [];
    while (true) {
        let url = `https://api.scratch.mit.edu/users/${user}/projects?limit=40&offset=${page * 40}`;
        console.log(url);
        let r = await (await fetch2(url)).json();
        projects.push(r);

        if (Object.keys(r).length < 40 || page > 10) {
            break;
        }
        page++;
    }
    projects = projects.flat(1);
    let projectCount = projects.length;

    let totalLoves = 0,
        totalFaves = 0,
        totalViews = 0;
    for (let project of projects) {
        totalViews += project.stats.views;
        totalLoves += project.stats.loves;
        totalFaves += project.stats.favorites;
    }
    console.log("total views, loves, faves", totalViews, totalLoves, totalFaves);
    data.totalViews = totalViews;
    data.totalLoves = totalLoves;
    data.totalFaves = totalFaves;
    data.loveToViewRatio = (totalLoves / totalViews) * 100 || 0;
    data.faveToViewRatio = (totalFaves / totalViews) * 100 || 0;
    data.faveToLoveRatio = (totalFaves / totalLoves) * 100 || 0;
    data.averageStats.averageViews = Math.round(totalViews / projectCount) || 0;
    data.averageStats.averageLoves = Math.round(totalLoves / projectCount) || 0;
    data.averageStats.averageFaves = Math.round(totalFaves / projectCount) || 0;

    let best = projects.map((a) => ({
        loves: a.stats.loves,
        faves: a.stats.favorites,
        views: a.stats.views,
        loveToViewRatio: (a.stats.loves / a.stats.views) * 100,
        faveToViewRatio: (a.stats.favorites / a.stats.views) * 100,
        faveToLoveRatio: (a.stats.favorites / a.stats.loves) * 100 || 0,
        // remixCount: a.stats.remixes,
        id: a.id,
        title: a.title,
        // img: a.image,
        img: `https://uploads.scratch.mit.edu/get_image/project/${a.id}_230x500.png`,
        time: new Date(a.history.shared).getTime(),
    }));
    best.sort((a, b) => b.loves + b.faves - (a.loves + a.faves));

    data.projects = best;
    return data;
}

api.projectStats = async function (request, reply) {
    let user = request.params.username;
  
    reply.headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    })
    reply
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send(JSON.stringify(await getStats(user), null, 4));
};

async function getUserData(username, extra) {
    let params = {
        username: username,
        scratchteam: "?",
        id: "?",
        browser: null,
        os: null,
        browserOStimeAgo: null,
        joinDate: "?",
        country: "?",
        profilePicture: "",
        projectsShared: "?",
    };
    params.nav = navbarCode
    let user = params.username;
    // console.log("extra", extra)
    if (extra == false) {
        let userInfo = await (await fetch2(`https://api.scratch.mit.edu/users/${user}`)).json();
        if (userInfo.code) {
            if (userInfo.code.includes("NotFound")) {
                return 404;
            }
        }
        params.id = userInfo.id;
        params.joinDate = new Date(userInfo.history.joined).toLocaleString();
        params.profilePicture = userInfo.profile.images["60x60"];
        params.country = userInfo.profile.country;
        params.username = userInfo.username;
        params.scratchteam = userInfo.scratchteam;
    }

    if (extra == true) {
        let projects = await (await fetch2(`https://api.scratch.mit.edu/users/${user}/projects`)).json();
        uaIf: if (Object.keys(projects).length == 0) {
            break uaIf;
        } else {
            let firstProject = Object.values(projects)[0].id;
            let projectData = await (await fetch2(`https://api.scratch.mit.edu/projects/${firstProject}`)).json();
            let projectDate = new Date(projectData.history.modified).getTime();
            let difference = Math.round((Date.now() - projectDate) / (1000 * 3600 * 24));
            params.browserOStimeAgo = difference;
            try {
                let agent = (await (await fetch2(`https://projects.scratch.mit.edu/${firstProject}?token=${projectData.project_token}`)).json()).meta.agent;
                let parsed = uap(agent);
                params.browser = `${parsed.browser.name} ${parsed.browser.version || ""}`.trim();
                if (parsed.os.name == "Windows" && parsed.os.version == "10") {
                    parsed.os.version = "10/11";
                }
                params.os = `${parsed.os.name} ${parsed.os.version || ""}`.trim();
            } catch {}
        }
        try {
            let root, text;
            root = HTMLParser.parse(await (await fetch2(`https://scratch.mit.edu/users/${user}/projects`)).text());
            text = root.querySelector(".box-head h2").childNodes[1].textContent;
            params.projectsShared = text.slice(text.indexOf("(") + 1, text.indexOf(")"));
        } catch {}
    }
    return params;
}

api.getUser = async function (request, reply) {
    let params = {
        username: request.params.username,
        usernameAsterisk: request.params.username,
        browser: "Loading...",
        os: "Loading...",
        browserOStimeAgo: "Loading...",
        id: "Loading...",
        joinDate: "?",
        country: "?",
        followers: "Loading...",
        following: "Loading...",
        profilePicture: "",
        stats: {},
        projectsShared: "Loading...",
    };
    params.nav = navbarCode
    let user = request.params.username;
    let data = await getUserData(user, false);
    if (data == 404) {
        return reply.view("/userNotFound.hbs", params);
    }
    params.browser = data.browser;
    params.os = data.os || "?";
    params.id = data.id || "?";
    params.browserOStimeAgo = data.browserOStimeAgo > 1 ? `(as of ${data.browserOStimeAgo} days ago)` : "";
    params.joinDate = data.joinDate;
    params.country = data.country;
    params.projectsShared = data.projectsShared;
    params.profilePicture = data.profilePicture;
    params.usernameAsterisk = data.username + (data.scratchteam ? "*" : "");
    //     let user = params.username;
    //     let userInfo = await (await fetch2(`https://api.scratch.mit.edu/users/${user}`)).json();
    //     if (userInfo.code) {
    //         if (userInfo.code.includes("NotFound")) {
    //             return reply.view("/src/pages/UserNotFound.hbs", { username: user });
    //         }
    //     }
    //     params.id = userInfo.id;
    //     params.joinDate = new Date(userInfo.history.joined).toLocaleString();
    //     params.profilePicture = userInfo.profile.images["60x60"];
    //     params.country = userInfo.profile.country;
    //     params.username = userInfo.username + (userInfo.scratchteam ? "*" : "");

    //     let projects = await (await fetch2(`https://api.scratch.mit.edu/users/${user}/projects`)).json();
    //     uaIf: if (Object.keys(projects).length == 0) {
    //         break uaIf;
    //     } else {
    //         let firstProject = Object.values(projects)[0].id;
    //         let projectData = await (await fetch2(`https://api.scratch.mit.edu/projects/${firstProject}`)).json();
    //         let projectDate = new Date(projectData.history.modified).getTime();
    //         let difference = Math.round((Date.now() - projectDate) / (1000 * 3600 * 24));
    //         if (difference > 1) {
    //             params.browserOStimeAgo = `(as of ${difference} days ago)`;
    //         }
    //         try {
    //             let agent = (await (await fetch2(`https://projects.scratch.mit.edu/${firstProject}?token=${projectData.project_token}`)).json()).meta.agent;
    //             let parsed = uap(agent);
    //             params.browser = `${parsed.browser.name} ${parsed.browser.version}`;
    //             if (parsed.os.name == "Windows" && parsed.os.version == "10") {
    //                 parsed.os.version = "10/11";
    //             }
    //             params.os = `${parsed.os.name} ${parsed.os.version}`;
    //         } catch {}
    //     }

    //     // project stats
    //     // let stats = await getStats(user);
    //     // stats.loveToViewRatio = `${Math.round(stats.loveToViewRatio * 100) / 100}%`;
    //     // params.stats = stats;

    //     // projects shared
    //     try {
    //         let root, text;
    //         root = HTMLParser.parse(await (await fetch2(`https://scratch.mit.edu/users/${user}/projects`)).text());
    //         text = root.querySelector(".box-head h2").childNodes[1].textContent;
    //         params.projectsShared = text.slice(text.indexOf("(") + 1, text.indexOf(")"));
    //     } catch {}

    return reply.view("/user.hbs", params);
};

api.getUserInfo = async function (request, reply) {
    reply.headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    })
    let data
    if (request.query.extra) {
        // console.log("extra")
        data = await getUserData(request.params.username, true)
    } else {
        // console.log("regular")
        data = await getUserData(request.params.username, false)
    }
    delete data.nav
    reply
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send(JSON.stringify(data, null, 4));
};

api.browserHistoryPage = async function (request, reply) {
    console.log(request.params);
    let params = {
        username: request.params.username,
        page: request.query.page || 1,
        nextPage: parseInt(request.query.page || 1) + 1,
    };
    params.nav = navbarCode
    params.prevPage = params.page > 1 ? params.page - 1 : 1;

    return reply.view("/browserHistory.hbs", params);
};

api.browserHistory = async function (request, reply) {
    let user = request.params.username;
    let data = [];
    let projects;

    // if (projectDB.has(user)) {
    if (false) {
        let offset = request.query.page ? (request.query.page - 1) * 40 : 0;
        projects = projectDB.get(user).slice(offset, offset + 40);
        console.log("using stored projects for user", user);
    } else {
        let page = 0;
        projects = [];
        while (true) {
            let url = `https://api.scratch.mit.edu/users/${user}/projects?limit=40&offset=${page * 40}`;
            console.log(url);
            let r = await (await fetch2(url)).json();
            projects.push(r);

            if (Object.keys(r).length < 40 || page > 10) {
                break;
            }
            page++;
        }
        projects = projects.flat(1);
        //console.log(projects[0], projects[1])
        projects.sort((a, b) => new Date(b.history.modified).getTime() - new Date(a.history.modified).getTime());

        let ids = projects.map((a) => a.id);
        // projectDB.set(user, ids);
        console.log("created project list for user:", user);

        let offset = request.query.page ? (request.query.page - 1) * 40 : 0;
        // projects = projectDB.get(user).slice(offset, offset + 40);
    }
    // console.log("using project list", projects)
    let promises = [];
    let projectInfo = [];
    for (let i = 0; i < projects.length; i++) {
        promises.push(
            new Promise(async function (resolve, reject) {
                let id = projects[i]; //.id
                let time, ua;
                // if (projectInfoDB.has(id.toString())) {
                if (false) {
                    time = projectInfoDB.get(`${id}.time`);
                    ua = projectInfoDB.get(`${id}.ua`);
                } else {
                    let info = await (await fetch2("https://api.scratch.mit.edu/projects/" + id)).json();
                    time = new Date(info.history.modified).getTime();
                    let token;
                    token = info.project_token;
                    try {
                        ua = (await (await fetch2("https://projects.scratch.mit.edu/" + id + "?token=" + token)).json()).meta.agent;
                    } catch {
                        ua = "";
                    }
                    // projectInfoDB.set(id.toString(), {});
                    // projectInfoDB.set(`${id}.time`, time);
                    // projectInfoDB.set(`${id}.ua`, ua);
                }
                projectInfo.push({ time: time, agent: ua, id: id });
                resolve();
            })
        );
    }

    function compare(a, b) {
        if (parseFloat(a.browser.split(" ")[1]) < parseFloat(b.browser.split(" ")[1])) {
            return -1;
        }
        if (parseFloat(a.browser.split(" ")[1]) > parseFloat(b.browser.split(" ")[1])) {
            return 1;
        }
        return 0;
    }

    await Promise.all(promises);
    projectInfo.sort((a, b) => a.time - b.time);

    for (let project of projectInfo) {
        let parsed = uap(project.agent);
        let browser = `${parsed.browser.name} ${parsed.browser.version}`;
        if (parsed.os.name == "Windows" && parsed.os.version == "10") {
            parsed.os.version = "10/11";
        }
        let os = `${parsed.os.name} ${parsed.os.version}`;
        if (!browser.includes("undefined") && !os.includes("undefined")) {
            data.push({ browser: browser, os: os, time: project.time, id: project.id });
        }
    }
    //data.sort(compare)
    reply.headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    })
    reply.code(200).header("Content-Type", "application/json; charset=utf-8").send(JSON.stringify(data, null, 4));
};

api.projectPage = async function getProjectPage(request, reply) {
    let params = {};
    let id = request.params.project;
    params = await getProjectData(id);
    if (params == 404) {
        return reply.view("/projectNotFound.hbs", {id: id, nav: navbarCode})
    } else {
        return reply.view("/project.hbs", params);
    }
};

api.apiProjectData = async function apiProjectData(request, reply) {
    reply.headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    })
    let data = await getProjectData(request.params.id)
    delete data.nav
    reply.code(200).header("Content-Type", "application/json; charset=utf-8").send(JSON.stringify(data, null, 4));
}

async function getProjectData(id) {
    if (!id) {
      return {}
    }
    let params = {};
    params.nav = navbarCode
    let basicInfo = await (await fetch2(`https://api.scratch.mit.edu/projects/${id}`)).json();
    if (basicInfo.code == "NotFound") {
        return 404;
    }
    params.id = id
    params.title = basicInfo.title;
    params.author = {};
    params.author.username = basicInfo.author.username;
    params.author.id = basicInfo.author.id;
    params.author.image = basicInfo.author.profile.images["60x60"];
    params.history = basicInfo.history;
    params.stats = basicInfo.stats;
    params.image = basicInfo.image;
    params.loveToViewRatio = (params.stats.loves / params.stats.views) * 100;
    params.faveToViewRatio = (params.stats.favorites / params.stats.views) * 100;
    params.faveToLoveRatio = (params.stats.favorites / params.stats.loves) * 100;

    let response = await fetch2("https://scratch.mit.edu/projects/" + id.toString() + "/remixtree/");
    let t = await response.text();

    let root = HTMLParser.parse(t);
    let els = root.getElementsByTagName("script");
  
    for (var i = 0; i < els.length; i++) {
        if (els[i].textContent.includes("var projectData = {")) {
            let el = els[i];
            if (el.textContent.includes("notsafe")) {
                params.reviewStatus = "notsafe";
                break
            }
            if (el.textContent.includes("safe")) {
                params.reviewStatus = "safe";
                break
            }
            if (el.innerHTML.includes("notreviewed")) {
                params.reviewStatus = "notreviewed";
                break
            }
            break;
        }
    }
    return params;
}

// module.exports = {
//     followering: api.followering,
//     projectStats: api.projectStats,
//     getUser: api.getUser,
//   browserHistoryPage: api.browserHistoryPage,
//   browserHistory: api.browserHistory
// };

module.exports = api;
