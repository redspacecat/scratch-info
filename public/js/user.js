let text = document.querySelector("#username-text").innerText;
history.replaceState(null, "", "/users/" + text.slice(0, text.endsWith("*") ? text.length - 1 : text.length));

handleDarkMode()

function handleDarkMode() {
    if (window.darkMode) {
        document.querySelector("html").classList.add("dark-mode")
        document.querySelectorAll("#container, #basicInfo, #browserandos, #otherinfo, #searchbox").forEach(el => el.classList.add("dark-mode"))
        document.querySelectorAll("table td").forEach(el => el.classList.add("dark-mode-table"))
        document.querySelectorAll("button").forEach(el => el.classList.add("dark-mode", "dark-mode-button"))
        document.querySelectorAll("a, #username-text").forEach(el => el.classList.add("dark-mode-link"))
    }
}

async function getMoreData() {
    let data = await (await fetch(`/api/v1/users/${username}/info?mode=followering`)).json();
    if (username != "griffpatch") {
        document.querySelector("#followers").innerText = data.followers || "?";

        document.querySelectorAll("#followers").forEach(function (a) {
            a.previousElementSibling.style.display = "none";
            a.hidden = false;
        });
    }
    document.querySelector("#following").innerText = data.following || "?";
    document.querySelectorAll("#following").forEach(function (a) {
        a.previousElementSibling.style.display = "none";
        a.hidden = false;
    });
}

async function getEvenMoreData() {
    // other data
    let data2 = await (await fetch(`/api/v1/users/${username}/info?mode=extra`)).json();
    let days = data2.browserOStimeAgo;
    let years = Math.floor(days / 365.25);
    document.querySelector("#browserOStimeAgo").innerText = `(as of${years ? " " + years + ` year${years > 1 ? "s" : ""},` : ""} ${Math.round(days % 365.25) || "?"} ${Math.round(days % 365.25) == 1 ? "day" : "days"} ago)`;
    document.querySelector("#browser").innerText = data2.browser || "?";
    document.querySelector("#os").innerText = data2.os || "?";
    document.querySelector("#projectsShared").innerText = data2.projectsShared || "?";

    document.querySelectorAll("#browserOStimeAgo, #browser, #os, #projectsShared").forEach(function (a) {
        a.previousElementSibling.style.display = "none";
        a.hidden = false;
    });

    if (data2.deleted) {
        document.querySelector("#profile-picture-link").parentElement.appendChild(htmlToNode(`<span style="margin-left: 10px;vertical-align: middle;"><img src="/images/warning.png" style="width: 32px;vertical-align: middle;"><span style="vertical-align: middle;">Deleted</span></span>`));
    }
}

async function getGriffyFollowers() {
    document.querySelector("span.info[data-info='griffyfollowers']").style.visibility = "visible";
    //document.querySelector("#followers").innerText = "Loading... (this may take up to 30 seconds if the server is slow)";
    let data =
        // await fetch("https://griffpatch-follower-count.glitch.me/count", {
        //     method: "POST",
        // })
        await fetch("/api/v1/users/griffpatch/followerCount");
    if (!data.ok) {
        data = "Oops, looks like there was an error: " + data.status;
    } else {
        data = await data.text();
    }
    document.querySelector("#followers").innerText = data;
    document.querySelector("#followers").previousElementSibling.style.display = "none";
    document.querySelector("#followers").hidden = false;
}
getMoreData();
getEvenMoreData();
if (username == "griffpatch") {
    getGriffyFollowers();
}

let projectData;
let currentSorting = "popularity";
let offset = 0;
let direction = 1;
// 0 is normal, 1 is inverted
document.querySelectorAll(".info[data-info]").forEach((el) => (el.style.display = "none"));

function htmlToNode(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const nNodes = template.content.childNodes.length;
    if (nNodes !== 1) {
        throw new Error("failed to parse");
    }
    return template.content.firstChild;
}
async function getProjectStats() {
    let stats = await (await fetch(`/api/v1/users/${username}/projectStats`)).json();
    projectData = stats.projects;
    applyStats(stats);
     if (projectData.length == 0) {
        document.querySelector("#user-projects-container").innerHTML = `<span style="text-align: center;font-size: large;" id="nothingFound">No Projects Found</span>`;
        document.querySelector("#user-projects-container").hidden = false;
        document.querySelector("#user-projects-container").style.textAlign = "center"
        return
    }
    createList();
    document.querySelector(".sorter").click();
    document.querySelectorAll(".info[data-info]").forEach((el) => (el.style.display = ""));
    document.querySelector("#user-projects-container").hidden = false;
}

function createList() {
    let projectListEl = document.querySelector("#projects");
    let baseProject = `<div class="one-project">
                <a>
                  <div style="width:240px;height:181px;" class="img-load-wrapper">
                    <div class="activity"></div>
                  </div>
                  <img class="project-image" loading="lazy" onload="this.previousElementSibling.style.display = 'none';this.style.visibility = 'visible'">
                </a>
                <br>
                <a class="project-title" onclick="topbar.show()"></a>
                <br>
                <div class="project-stats-line">
                  <span class="loves"></span>
                  <span class="faves"></span>
                  <span class="views"></span>
                </div>
                <div class="project-stats-line">
                  <span class="loveToViewRatio"></span>
                  <span class="loveToViewRatio"></span>
                </div>
                <div class="project-stats-line">
                  <span class="faveToLoveRatio"></span>
                </div>
              </div>`;
    let replaceRegex = /\\n[ ]+/gi;
    baseProject = baseProject.replaceAll(replaceRegex, "");
    // for (let project of projectData) {
    // for (let [i, project] of projectData.entries()) {
    let i = 0;
    while (i < 16 /*Math.min(offset, projectData.length)*/) {
        let project = projectData[offset + i];
        if (!project) {
            document.querySelector("#loadMoreButton").hidden = true;
            break;
        }
        let newProject = htmlToNode(baseProject);
        newProject.querySelector("img").src = project.img;
        newProject.querySelector("a").href = `/projects/${project.id}`;
        newProject.querySelectorAll("a")[1].innerText = project.title;
        newProject.querySelectorAll("a")[1].href = `/projects/${project.id}`;
        newProject.querySelectorAll("span")[0].innerText = project.loves.toLocaleString();
        newProject.querySelectorAll("span")[1].innerText = project.faves.toLocaleString();
        newProject.querySelectorAll("span")[2].innerText = project.views.toLocaleString();
        newProject.querySelectorAll("span")[3].innerText = `${Math.round(project.loveToViewRatio * 100) / 100}% love/view`;
        newProject.querySelectorAll("span")[4].innerText = `${Math.round(project.faveToViewRatio * 100) / 100}% fave/view`;
        newProject.querySelectorAll("span")[5].innerText = `${Math.round(project.faveToLoveRatio * 100) / 100}% favorite/love`; // newProject.querySelectorAll("span")[6].innerText = project.remixCount.toLocaleString()

        projectListEl.appendChild(newProject);
        i++;
    }

    search(document.querySelector("#searchbox").value);
    handleDarkMode()
    handleLinks()
}

function applyStats(stats) {
    document.querySelector("#loveToViewRatio").innerText = `${Math.round(stats.loveToViewRatio * 100) / 100}% love/view`;
    document.querySelector("#faveToViewRatio").innerText = `${Math.round(stats.faveToViewRatio * 100) / 100}% favorite/view`;
    document.querySelector("#faveToLoveRatio").innerText = `${Math.round(stats.faveToLoveRatio * 100) / 100}% favorite/love`;
    document.querySelector("#totalLoves").innerText = stats.totalLoves.toLocaleString();
    document.querySelector("#totalFaves").innerText = stats.totalFaves.toLocaleString();
    document.querySelector("#totalViews").innerText = stats.totalViews.toLocaleString();
    document.querySelector("#averageLoves").innerText = stats.averageStats.averageLoves.toLocaleString();
    document.querySelector("#averageFaves").innerText = stats.averageStats.averageFaves.toLocaleString();
    document.querySelector("#averageViews").innerText = stats.averageStats.averageViews.toLocaleString();

    document.querySelectorAll("#totalLoves, #totalFaves, #totalViews, #loveToViewRatio, #faveToViewRatio, #faveToLoveRatio, #averageLoves, #averageFaves, #averageViews").forEach(function (a) {
        a.previousElementSibling.style.display = "none";
        a.hidden = false;
    });
}

function popularitySort(a, b) {
    if (direction == 1) {
        if (a.loves + a.faves < b.loves + b.faves) {
            return -1;
        }
        if (a.loves + a.faves > b.loves + b.faves) {
            return 1;
        }
        if (a.views < b.views) {
            return -1;
        }
        if (a.views > b.views) {
            return 1;
        }
        return 0;
    } else {
        if (b.loves + b.faves < a.loves + a.faves) {
            return -1;
        }
        if (b.loves + b.faves > a.loves + a.faves) {
            return 1;
        }
        if (b.views < a.views) {
            return -1;
        }
        if (b.views > a.views) {
            return 1;
        }
        return 0;
    }
}

function sortBy(sorter, el) {
    offset = 0;
    if (mobileAndTabletCheck()) {
        document.querySelector("#loadMoreButton").hidden = false;
    }
    document.querySelectorAll(".sorter").forEach((el) => (el.style.fontWeight = ""));
    el.style.fontWeight = "bold";
    if (currentSorting == sorter) {
        direction = 1 - direction;
    } else {
        direction = 0;
    }
    currentSorting = sorter;
    if (direction == 0) {
        if (sorter == "popularity") {
            projectData.sort(popularitySort); // projectData.sort((a, b) => (b.loves + b.faves) - (a.loves + a.faves))
        } else {
            projectData.sort((a, b) => b[sorter] - a[sorter]);
        }
    } else {
        if (sorter == "popularity") {
            projectData.sort(popularitySort); // projectData.sort((a, b) => (a.loves + a.faves) - (b.loves + b.faves))
        } else {
            projectData.sort((a, b) => a[sorter] - b[sorter]);
        }
    }
    document.querySelector("#projects").innerHTML = "";
    createList();
}
getProjectStats();

function search(query) {
    let els = document.querySelectorAll(".one-project");
    for (let el of els) {
        if (el.querySelector(".project-title").innerText.toLowerCase().includes(query.toLowerCase())) {
            el.hidden = false;
        } else {
            el.hidden = true;
        }
    }
}

window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

if (mobileAndTabletCheck()) {
    document.querySelector("#loadMoreButton").hidden = false;
    document.querySelector(".nav-logo").style.textShadow = "";
    console.log("mobile");
} else {
    window.addEventListener("scroll", function () {
        if (Math.abs(window.scrollY - (document.documentElement.scrollHeight - document.documentElement.clientHeight)) < 50) {
            offset += 16;
            try {
                createList();
            } catch {}
        }
    });
}
