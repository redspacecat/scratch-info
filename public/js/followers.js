document.querySelector("#f").addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();
    count();
    return 0;
});

async function request(url) {
    const r = await fetch("https://renderapi.quuq.dev/proxy", {
        headers: {
            "X-URL": url
        }
    })
    return r
}

async function count() {
    const username = document.querySelector("#un").value;

    document.querySelector("#bar").style.width = "5%";
    document.querySelector("#progress").hidden = false;
    document.querySelector("#progress").style.opacity = 1;
    document.querySelector("#outputs").hidden = true;
    const it = setInterval(function () {
        const currentWidth = parseInt(document.querySelector("#bar").style.width.replace("%", ""));
        const changePercent = (20 - currentWidth) / 10;
        document.querySelector("#bar").style.width = currentWidth + changePercent + "%";
    }, 250);
    const re = await fetch(`/api/v1/users/${username}/info?mode=followering`)
    const { followers } = await re.json()
    clearInterval(it);
    if (Object.keys(re).length == 1) {
        document.querySelector("#bar").style.width = "100%";

        document.querySelector("#output").innerHTML = `${username} does not exist`;
        document.querySelector("#output2").innerHTML = "";
        setTimeout(() => {
            document.querySelector("#outputs").hidden = false;
            document.querySelector("#progress").style.opacity = 0;
        }, 1000);
        return
    }

    let offset = 100;
    let previous = 0;
    let total;
    while (true) {
        console.log("trying", offset)
        let r = await (await request(`https://api.scratch.mit.edu/users/${username}/followers?limit=40&offset=${offset}`)).json();

        if (r.length < 40) {
            total = offset;
            break;
        }

        // document.querySelector("#bar").style.width = `${Math.min(offset / followers * 70, 70) + 5}%`
        const currentWidth = parseInt(document.querySelector("#bar").style.width.replace("%", ""));
        const changePercent = (65 - currentWidth) / 10;
        document.querySelector("#bar").style.width = Math.min(65, 20 + currentWidth + changePercent) + "%";

        previous = offset;
        offset *= 2;
    }

    console.log(previous, total);

    let max = total;
    let min = previous;
    total = 0
    while (max - min > 0) {
        const currentWidth = parseInt(document.querySelector("#bar").style.width.replace("%", ""));
        const changePercent = (100 - currentWidth) / 10;
        document.querySelector("#bar").style.width = Math.min(100, currentWidth + changePercent) + "%";

        let attempt = Math.floor((max + min) / 2);
        console.log("trying", attempt);
        let r = await (await request(`https://api.scratch.mit.edu/users/${username}/followers?limit=40&offset=${attempt}`)).json();
        if (r.length < 40 && r.length > 0) {
            total = attempt + r.length;
            break;
        } else if (r.length == 0) {
            max = attempt;
        } else {
            min = attempt;
        }
    }
    document.querySelector("#bar").style.width = "100%";

    console.log(total);
    document.querySelector("#output").innerHTML = `${username} has <strong>${total}</strong> followers ever.`;
    document.querySelector("#output2").innerHTML = `${username} has <strong>${followers ?? 0}</strong> followers following them currently.`;
    setTimeout(() => {
        document.querySelector("#outputs").hidden = false;
        document.querySelector("#progress").style.opacity = 0;
    }, 1000);
}
