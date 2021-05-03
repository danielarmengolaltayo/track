/////////////////// global variables

const urlParams = new URLSearchParams(window.location.search);
const userA = urlParams.get('userA');
const userB = urlParams.get('userB');
const form = urlParams.get('form');
const formG = urlParams.get('formG');

/////////////////// config airtable

// keys
const key = urlParams.get('key'); //API key
// var airtableApiKey = location.hash.substring(1); //add the apiKey at the end of the url (..index.html#apiKey)
// if (airtableApiKey == "") { alert("AIRTABLE_API_KEY is missing (..index.html#apiKey)"); } // error message
var airtableBaseKey = "appaGvmsLzxTrLLh7";

// base
var airtableBaseNameA = userA;
var airtableBaseNameB = userB;
var airtableBaseNameAgoals = userA + " goals";
var airtableBaseNameBgoals = userB + " goals";

// view
var airtableViewName = "Grid view";

// records
var a = [];
var b = [];
var ag = [];
var bg = [];

// retrieving data from airtable
var Airtable = require('airtable');
var base = new Airtable({ apiKey: key }).base(airtableBaseKey);

var loadA = false;
var loadB = false;
var loadAgoals = false;
var loadBgoals = false;

base(airtableBaseNameA).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.forEach(function (record) {
        a.push({
            what: record.get("what"),
            when: dayjs(record.get("when"))
        });
    });
    loadA = true;
    render();

}, function done(err) {
    if (err) { console.error(err); return; }
});

base(airtableBaseNameB).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.forEach(function (record) {
        b.push({
            what: record.get("what"),
            when: dayjs(record.get("when"))
        });
    });
    loadB = true;
    render();

}, function done(err) {
    if (err) { console.error(err); return; }
});

base(airtableBaseNameAgoals).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.forEach(function (record) {
        ag.push({
            goal: record.get("goals")
        });
    });
    loadAgoals = true;
    render();

}, function done(err) {
    if (err) { console.error(err); return; }
});

base(airtableBaseNameBgoals).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.forEach(function (record) {
        bg.push({
            goal: record.get("goals")
        });
    });
    loadBgoals = true;
    render();

}, function done(err) {
    if (err) { console.error(err); return; }
});

/////////////////// variables

var initDate;
var t = [];
var g = [];

/////////////////// logic

function sortByDate() {
    // for (var i = 0; i < b.length; i++) {
    //     console.log("original array: " + b[i].what + " " + b[i].when);
    // }
    // https://stackoverflow.com/questions/10123953/how-to-sort-an-object-array-by-date-property
    a.sort(function (x, y) {
        return dayjs(x.when) - dayjs(y.when);
    });
    b.sort(function (x, y) {
        return dayjs(x.when) - dayjs(y.when);
    });
    // for (var i = 0; i < b.length; i++) {
    //     console.log("sorted array: " + b[i].what + " " + b[i].when);
    // }
}

function getInitialDate() {
    if (a[0].when > b[0].when) {
        initDate = dayjs(b[0].when);
    } else {
        initDate = dayjs(a[0].when);
        //en el cas que siguin les dues dates la mateixa, dona igual quina agafem
    }
}

function createTimeline() {
    var days = dayjs().diff(initDate, 'day') + 1;
    console.log("days: " + days);
    for (var i = 0; i < days; i++) {
        t.push({
            d: initDate.add(i, 'day')
        });
    }
    // for (var i = 0; i < t.length; i++) {
    //     console.log("day " + t[i].format());
    // }
}

function createGoalsList() {
    if (ag.length > bg.length) {
        for (var i = 0; i < ag.length; i++) {
            g.push({
                a: ag[i].goal
            });
        }
        for (var i = 0; i < bg.length; i++) {
            g[i].b = bg[i].goal;
        }
        for (var i = bg.length; i < ag.length; i++) {
            g[i].b = "";
        }
    } else {
        for (var i = 0; i < bg.length; i++) {
            g.push({
                b: bg[i].goal
            });
        }
        for (var i = 0; i < ag.length; i++) {
            g[i].a = ag[i].goal;
        }
        for (var i = ag.length; i < bg.length; i++) {
            g[i].a = "";
        }
    }
}

function mergeMultipleEntriesForTheSameDate() {
    // for (var i = 0; i < a.length; i++) {
    //     console.log("array pre " + a[i].what + " " + a[i].when);
    // }
    for (var i = 1; i < a.length; i++) {
        if (a[i].when.isSame(a[i - 1].when)) {
            a[i - 1].what = a[i].what + "<br>" + a[i - 1].what;
            a.splice(i, 1);
            i--;
        }
    }
    // for (var i = 0; i < a.length; i++) {
    //     console.log("array post " + a[i].what + " " + a[i].when);
    // }
    for (var i = 1; i < b.length; i++) {
        if (b[i].when.isSame(b[i - 1].when)) {
            b[i - 1].what = b[i].what + "<br>" + b[i - 1].what;
            b.splice(i, 1);
            i--;
        }
    }
}

function fillTimeline() {
    var ia = 0;
    var ib = 0;
    // for (var i = 0; i < a.length; i++) {
    //     console.log("a: " + a[i].what + " - " + a[i].when.format('YYYY/MM/DD'));
    // }
    // for (var i = 0; i < b.length; i++) {
    //     console.log("b: " + b[i].what + " - " + b[i].when.format('YYYY/MM/DD'));
    // }
    for (var it = 0; it < t.length; it++) {
        if (a[ia].when.isSame(dayjs(t[it].d))) {
            t[it].a = a[ia].what;
            if (ia < a.length - 1) {
                ia++;
            }
        }
        if (b[ib].when.isSame(dayjs(t[it].d))) {
            t[it].b = b[ib].what;
            if (ib < b.length - 1) {
                ib++;
            }
        }
    }
    for (var i = 0; i < t.length; i++) {
        console.log("t: " + t[i].a + " - " + t[i].d.format('YYYY/MM/DD') + " - " + t[i].b);
    }
}

function fillHTML() {
    var header = document.getElementById("header");
    var records = document.getElementById("records");
    var goals = document.getElementById("goals");
    var progress = document.getElementById("progress");

    goals.innerHTML = "<div class='goal header'><div class='left'>" + userA + "'s goals</div><div class='date'></div><div class='right'>Your goals&nbsp;&nbsp;<a href='https://airtable.com/" + formG + "' target='_blank'><sup>Edit</sup></a></div></div>";
    progress.innerHTML = "<div class='record header'><div class='left'>" + userA + "'s progress</div><div class='date'></div><div class='right'>Your progress&nbsp;&nbsp;<sup><a href='https://airtable.com/" + form + "' target='_blank'>Add</a></sup></div></div></div>";

    //header with usernames
    // header.innerHTML = header.innerHTML + "<div class='record header'><div class='left'>" + userA + "</div><div class='date'></div><div class='right'>Your progress</div></div><div class='record'><div class='left'></div><div class='date'><a href='https://airtable.com/" + form + "' target='_blank'>add</a></div><div class='right'></div></div></div>";
    for (var i = t.length - 1; i >= 0; i--) {
        var d;
        if (i == t.length - 1) {
            d = "Today";
        } else if (i == t.length - 2) {
            d = "Yesterday";
        } else {
            d = t[i].d.format('YYYY/MM/DD');
        }
        //check if undefined and substitute it with an empty string
        if (t[i].a == undefined) {
            t[i].a = "";
        }
        if (t[i].b == undefined) {
            t[i].b = "";
            d = "<div class='date'>" + d + "</div>";
        } else {
            d = "<div class='date' style='text-decoration: line-through;'>" + d + "</div>";
        }
        records.innerHTML = records.innerHTML + "<div class='record'><div class='left'>" + t[i].a + "</div>" + d + "<div class='right'>" + t[i].b + "</div></div>";
    }
    //footer
    // header.innerHTML = "<div class='goal header'><div class='left'></div><div class='date'></div><div class='right'>Your goals <a href='https://airtable.com/" + formG + "' target='_blank'><sup>Edit</sup></a></div></div>" + header.innerHTML;
    // for (var i = 0; i < g.length; i++) {
    //     goals.innerHTML = goals.innerHTML + "<div class='goal'><div class='left'>" + g[i].a + "</div><div class='date'></div><div class='right'>" + g[i].b + "</div></div>";
    // }
    goals.innerHTML = goals.innerHTML + "<div class='goal'><div class='left'>" + g[0].a + "</div><div class='date'></div><div class='right'>" + g[0].b + "</div></div>";
}

function addLinkForm() {
    var add = document.getElementById("add");
    add.innerHTML = "<div class='record'><div class='left'></div><div class='date'></div><div class='right'><a href='https://airtable.com/" + form + "' target='_blank'>What progress have you made today?</a></div></div>";
}

function render() {
    if (loadA == true && loadB == true && loadAgoals == true && loadBgoals == true) {
        sortByDate();
        getInitialDate();
        createTimeline();
        createGoalsList();
        mergeMultipleEntriesForTheSameDate();
        fillTimeline();
        fillHTML();
        // addLinkForm();
        // setTimeout(function () {
        //     document.getElementById('last').scrollIntoView({ behavior: "smooth" });
        // }, 500);
        console.log("rendered!");
    }
}


/*
- no tratar goals como lista
*/
