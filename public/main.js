window.addEventListener("DOMContentLoaded", setup3)

function setup3() {
    let s = document.createElement("script")
    s.src = "https://cdn.jsdelivr.net/gh/buunguyen/topbar@latest/topbar.min.js"
    document.head.appendChild(s)
    document.querySelectorAll("a").forEach(a => a.addEventListener("click", function() {topbar.show()}))
}