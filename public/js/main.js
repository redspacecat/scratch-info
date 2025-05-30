window.addEventListener("DOMContentLoaded", setup3);

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
    document.querySelectorAll("a").forEach(function (a) {
        if (a.target != "_blank") {
            a.addEventListener("click", function (e) {
                if (!e.ctrlKey) {
                    topbar.show();
                }
            });
        }
    });

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
                setTimeout(function () {
                    const submitButton = this.document.querySelector(".submit-container");
                    submitButton.style.display = "";
                    submitButton.disabled = false;
                    document.querySelector("#loading-spinner").style.display = "none";

                    toggleSearch(currentSearchType)
                }, 100);
            }
        } else {
            console.log("This page was loaded normally and not from the bfcache.");
        }
        console.log("Original navigationType:" + performance.getEntriesByType("navigation")[0].type);
    });
}
