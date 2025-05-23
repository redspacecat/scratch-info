window.addEventListener("load", info);
function info() {
    let infoEls = document.querySelectorAll(".info[data-info]");
    for (let el of infoEls) {
        el.addEventListener("click", infoPopup);
    }
}

let t = {
    popularity: {
        title: 'What is "popularity"?',
        text: '"Popularity" sorts by loves + favorites. If those are the same for two projects, it sorts by views.',
    },
    lovetoview: {
        title: "What is love/view ratio?",
        text: "love/view ratio is the percent of people who viewed and loved the project.",
    },
    favetoview: {
        title: "What is fave/view ratio?",
        text: "fave/view ratio is the percent of people who viewed and favorited the project. (Note: 'fave' is short for 'favorite')",
    },
    favetolove: {
        title: "What is fave/love ratio?",
        text: "fave/love ratio is the percent of people who loved the project compared to the number of people who favorited it. For example, if 10 people loved a project and 5 people favorited it, that would be a fave/love ratio of 50%. Most fave/love ratios are around 80%-90%",
    },
    totalstats: {
        title: "What is total project stats?",
        text: "Total project statistics is all the users loves, favorites, and views added up.",
    },
    averagestats: {
        title: "What is average project stats?",
        text: "Average project statistics is the average number of loves, favorites, and views each project gets. This is calculated from the total project statistics divided by the number of projects.",
    },
    reviewstatus: {
      title: "What is review status?",
      text: "A project can either be rated FE (For Everyone), NFE (Not For Everyone), or not be reviewed. NFE projects cannot appear on search. More info <a href='https://en.scratch-wiki.info/wiki/Project_Review_Status'>here</a>"
    },
    browserandos: {
      title: "Where does the Browser and OS information come from?",
      text: "The information about the user's browser and operating system are fetched from their latest project. This means that if they haven't made a new project recently, it might show outdated information"
    },
    griffyfollowers: {
      title: "How do we know @griffpatch's follower count?",
      text: "Since his followers page does load on the Scratch website. I made <a href='https://griffpatch-follower-count.glitch.me'>https://griffpatch-follower-count.glitch.me</a> to get his follower count using the api instead."
    }
};

function infoPopup(e) {
    let thingy = this.dataset.info;
    e.preventDefault();
    e.stopPropagation();
    Swal.fire({
        title: t[thingy].title,
        html: t[thingy].text,
        icon: "info",
    });
}