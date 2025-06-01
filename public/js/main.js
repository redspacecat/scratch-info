window.addEventListener("DOMContentLoaded", setup3);
window.darkMode = (localStorage.getItem("darkmode")) ? ((localStorage.getItem("darkmode") == "true") ? true: false): window.matchMedia('(prefers-color-scheme: dark)').matches
console.log(darkMode)

if (window.darkMode) {
    document.documentElement.classList.add("dark")
}

function setup3() {
    // add topbar loading bar
    let s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/buunguyen/topbar@latest/topbar.min.js";
    s.onload = function () {
        topbar.config({ autoRun: false });
        topbar.show();
        topbar.progress(Math.min(Math.max(Math.random(), 0.5), 0.75));
        setTimeout(function () {
            topbar.hide();
            topbar.config({ autoRun: true });
        }, 100);
        // topbar.show()
        // window.addEventListener("load", topbar.hide)
    };
    document.head.appendChild(s);
    
    handleLinks()

    // add vercel analytics
    window.va =
        window.va ||
        function () {
            (window.vaq = window.vaq || []).push(arguments);
        };
    let s2 = document.createElement("script");
    s2.src = "/_vercel/insights/script.js";
    s2.defer = true;
    document.head.appendChild(s2);

    // fix history back and forth
    // window.onpopstate = function() {
    // if(window.performance.navigation.type === 2) {
    // setInterval(function() {
    //     if (String(window.performance.getEntriesByType("navigation")[0].type) === "back_forward") {
    //         console.log("went back/forward")
    //         setTimeout(topbar.hide, 100)
    //     }
    // }, 500)
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            console.log("This page has been restored from the bfcache.");
            topbar.hide();

            if (location.pathname == "/") {
                // setTimeout(function () {
                //     const submitButton = this.document.querySelector(".submit-container");
                //     submitButton.style.display = "";
                //     submitButton.disabled = false;
                //     document.querySelector("#loading-spinner").style.display = "none";

                //     toggleSearch(currentSearchType)
                // }, 100);
                location.reload()
            }
        } else {
            console.log("This page was loaded normally and not from the bfcache.");
        }
        console.log("Original navigationType:" + performance.getEntriesByType("navigation")[0].type);
    });

    if (window.darkMode) {
        document.querySelector("#search-input").style.color = "white"
    }
}

function toggleDarkMode() {
    let old = localStorage.getItem("darkmode")
    if (old == "false") {
        localStorage.setItem("darkmode", true)
    } else {
        localStorage.setItem("darkmode", false)
    }
    let dark = localStorage.getItem("darkmode")
    console.log("darkmode", dark)
    location.reload()
}

function handleLinks() {
    document.querySelectorAll("a").forEach(function (a) {
        if (a.target != "_blank") {
            a.addEventListener("click", function (e) {
                if (!e.ctrlKey) {
                    topbar.show();
                }
            });
        }
    });
}