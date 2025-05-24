window.addEventListener("DOMContentLoaded", function () {
    document.getElementById("search-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const query = document.getElementById("search-input").value.trim();
        if (query) {
            if (parseInt(query)) {
                topbar.show();
                location.href = `/projects/${query}`;
            } else {
                topbar.show();
                location.href = `/users/${query}`;
            }
        }
    });
});
