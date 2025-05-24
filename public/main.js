window.addEventListener("DOMContentLoaded", setup3)

function setup3() {
    let s = document.createElement("script")
    s.src = "https://cdn.jsdelivr.net/gh/buunguyen/topbar@latest/topbar.min.js"
    s.onload = function() {
        topbar.config({autoRun: false})
        topbar.show()
        topbar.progress(0.7)
        topbar.hide()
        topbar.config({autoRun: true})
    }
    document.head.appendChild(s)
    document.querySelectorAll("a").forEach(function(a) {
        if (a.target != "_blank") {
            a.addEventListener("click", function() {
                topbar.show()
            })
        }
    })
}