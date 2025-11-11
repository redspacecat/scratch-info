if (window.darkMode) {
    handleDarkMode()
}

document.querySelector("select").value = country || "all";

if (country && country != "none" && country != "all") {
    document.querySelector("#countrybox").innerText = " in " + country;
}
const params = new URLSearchParams(location.search);
let item = params.get("highlight");

if (item) {
    const el = document.querySelector(`#item-${item}`);
    el.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center",
        behavior: "smooth",
    });
    el.style.outline = "5px solid #82b7c8";
}

if (country == "none") country = "";
if (page > 1) {
    document.querySelector("#prev").href = `?page=${page - 1}&location=${country}`;
    document.querySelector("#prev").hidden = false;
    document.querySelector("#first").href = `?page=1&location=${country}`;
    document.querySelector("#first").hidden = false;
}
if (params.has("error")) {
    const error = params.get("error");
    if (error == "usernotfound") {
        alertify.alert("User not found in rankings").set({ title: "Error" }).set({ movable: false });
    }
    params.delete("error");
    history.replaceState(null, "", "/rankings" + (params.toString() ? "?" : "") + params.toString());
}
if (!document.querySelector("#user_list").children.length) {
    alertify.alert("No users were found. This could due to an invalid page number or a server-side timeout error while fetching users.").set({ title: "No users found" }).set({ movable: false });
}

document.querySelector("#next").href = `?page=${page + 1}&location=${country}`;
let pages;
fetch(`/api/v1/rankings/count?country=${country}`)
    .then((r) => r.text())
    .then(function (t) {
        pages = Math.ceil(parseInt(t) / 100);
        document.querySelector("#actual-amount").innerText = pages;
        document.querySelector("#amount").querySelector(".img-load-wrapper").remove();
    })
    .then(() => {
        console.log(pages, "pages");
        if (page == pages) {
            document.querySelector("#next").hidden = true;
        } else {
            document.querySelector("#last").href = `?page=${pages}&location=${country}`;
            document.querySelector("#last").hidden = false;
        }

        document.querySelector("#buttons-bottom").innerHTML = document.querySelector("#buttons").innerHTML;
    });

function setCountry() {
    topbar.show();
    const n = document.querySelector("select").value;
    location.search = "?location=" + n;
}

function changePage(n) {
    topbar.show()
    location.search = `?page=${n}&location=${country}`
}

function handleDarkMode() {
    document.querySelector("html").classList.add("dark-mode");
    document.querySelector("html").classList.add("dark-mode-ranks");
}