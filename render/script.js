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
var ag, bg;

// retrieving data from airtable
var Airtable = require('airtable');
var base = new Airtable({ apiKey: key }).base(airtableBaseKey);

var loadA = false;
var loadB = false;
var loadAG = false;
var loadBG = false;

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
    records.slice(0, 1).forEach(function (record) {
        ag = record.get("goals");
    });
    loadAG = true;
    render();

}, function done(err) {
    if (err) { console.error(err); return; }
});

base(airtableBaseNameBgoals).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.slice(0, 1).forEach(function (record) {
        bg = record.get("goals");
    });
    loadBG = true;
    render();

}, function done(err) {
    if (err) { console.error(err); return; }
});

/////////////////// variables

var initialDate;
var t = []; //timeline

/////////////////// logic

function sortArrayOfObjectsByDate(x, date) {
    // https://stackoverflow.com/questions/10123953/how-to-sort-an-object-array-by-date-property
    x.sort(function (a, b) {
        return a[date] - b[date];
    });
}

function getInitialDate(a, b) {
    if (a > b) {
        return b;
    } else {
        return a;
    }
}

function populateTimelineArrayWithAnObjectForEachDate(startDate) {
    var x = [];
    var days = dayjs().diff(startDate, 'day') + 1;
    // console.log("days: " + days);
    for (var i = 0; i < days; i++) {
        x.push({
            a: [],
            b: [],
            d: startDate.add(i, 'day')
        });
    }
    return x;
}

function mergeMultipleEntriesForTheSameDate() {
    for (var i = 1; i < a.length; i++) {
        if (a[i].when.isSame(a[i - 1].when)) {
            a[i - 1].what = a[i].what + "<br>" + a[i - 1].what;
            a.splice(i, 1);
            i--;
        }
    }
    for (var i = 1; i < b.length; i++) {
        if (b[i].when.isSame(b[i - 1].when)) {
            b[i - 1].what = b[i].what + "<br>" + b[i - 1].what;
            b.splice(i, 1);
            i--;
        }
    }
}

function fillTimelineWithProgress() {
    var ia = 0;
    var ib = 0;
    for (var it = 0; it < t.length; it++) {
        var iaa = 0;
        while (a[ia].when.isSame(dayjs(t[it].d))) {
            t[it].a[iaa] = a[ia].what;
            iaa++;
            if (ia < a.length - 1) {
                ia++;
            } else {
                break;
            }
        }
        var ibb = 0;
        while (b[ib].when.isSame(dayjs(t[it].d))) {
            t[it].b[ibb] = b[ib].what;
            ibb++;
            if (ib < b.length - 1) {
                ib++;
            } else {
                break;
            }
        }
    }
    for (var i = 0; i < t.length; i++) {
        console.log(t[i].d.format('YYYY/MM/DD'));
        for (var j = 0; j < t[i].a.length; j++) {
            console.log("a: " + t[i].a[j]);
        }
        for (var j = 0; j < t[i].b.length; j++) {
            console.log("b: " + t[i].b[j]);
        }
    }
}

// function fillTimelineWithProgress() {
//     var ia = 0;
//     var ib = 0;
//     for (var it = 0; it < t.length; it++) {
//         if (a[ia].when.isSame(dayjs(t[it].d))) {
//             t[it].a = a[ia].what;
//             if (ia < a.length - 1) {
//                 ia++;
//             }
//         }
//         if (b[ib].when.isSame(dayjs(t[it].d))) {
//             t[it].b = b[ib].what;
//             if (ib < b.length - 1) {
//                 ib++;
//             }
//         }
//     }
//     // for (var i = 0; i < t.length; i++) {
//     //     console.log("t: " + t[i].a + " - " + t[i].d.format('YYYY/MM/DD') + " - " + t[i].b);
//     // }
// }

function fillHTML() {
    var goals = document.getElementById("goals");
    var progress = document.getElementById("progress");
    var records = document.getElementById("records");

    // var dotA, dotB;
    var edit = "<a href='https://airtable.com/" + formG + "' target='_blank'><span class='small'>Edit</span></a>";
    var add = "&nbsp;<br><a href='https://airtable.com/" + form + "' target='_blank'><span class='small'>Add</span></a><br>&nbsp;";

    ag = returnEmptyStringIfUndefined(ag);
    bg = returnEmptyStringIfUndefined(bg);
    goals.innerHTML = goals.innerHTML + "<div class='day'><div class='left'></div><div class='date'><span class='logo'>Track</span></div><div class='right'></div></div>";
    goals.innerHTML = goals.innerHTML + "<div class='day header'><div class='left'><div class='record'><div>" + userA + "</div><div class='dot transparent'>&#9679;</div></div></div><div class='date'></div><div class='right'><div class='record'><div class='dot transparent'>&#9679;</div><div>" + userB + "</div></div></div></div><div class='day'><div class='left'><div class='record'><div>" + ag + "</div><div class='dot transparent'>&#9679;</div></div></div><div class='date'>" + edit + "</div><div class='right'><div class='record'><div class='dot transparent'>&#9679;</div><div>" + bg + "</div></div></div></div>";
    // progress.innerHTML = "<div class='day header'><div class='left'></div><div class='date'></div><div class='right'>" + add + "</div></div></div>";

    records.innerHTML = records.innerHTML + "<div class='day'><div class='left'></div><div class='date'>" + add + "</div><div class='right'></div></div>";

    for (var i = t.length - 1; i >= 0; i--) {
        var d;
        if (i == t.length - 1) {
            d = "Today";
        } else if (i == t.length - 2) {
            d = "Yesterday";
        } else {
            d = t[i].d.format('YYYY/MM/DD');
        }
        // if (t[i].b == undefined) {
        //     d = "<div class='date'>" + d + "</div>";
        // } else {
        //     d = "<div class='date' style='text-decoration: line-through;'>" + d + "</div>";
        // }
        d = "<div class='date'>" + d + "</div>";
        // if (t[i].a == undefined || t[i].b == undefined) {
        //     if (t[i].a == undefined) {
        //         dotA = "";
        //     } else if (t[i].b == undefined) {
        //         dotB = "";
        //     }
        // } else {
        //     dotA = "<div class='dot'>&#9679;</div>";
        //     dotB = dotA;
        // }
        var dot = "<div class='dot'>&#9679;</div>";
        var left = "<div class='left'>";
        for (var j = 0; j < t[i].a.length; j++) {
            if (t[i].a[j] != undefined) {
                left = left + "<div class='record'><div>" + t[i].a[j] + "</div>" + dot + "</div>";
            }
        }
        left = left + "</div>";
        var right = "<div class='right'>";
        for (var j = 0; j < t[i].b.length; j++) {
            if (t[i].b[j] != undefined) {
                right = right + "<div class='record'>" + dot + "<div>" + t[i].b[j] + "</div></div>";
            }
        }
        right = right + "</div>";
        // t[i].b = returnEmptyStringIfUndefined(t[i].b);

        records.innerHTML = records.innerHTML + "<div class='day'>" + left + d + right + "</div>";
    }

}

function render() {
    if (loadA == true && loadB == true && loadAG == true && loadBG == true) {
        sortArrayOfObjectsByDate(a, "when");
        sortArrayOfObjectsByDate(b, "when");
        initialDate = getInitialDate(a[0].when, b[0].when);
        t = populateTimelineArrayWithAnObjectForEachDate(initialDate);
        // mergeMultipleEntriesForTheSameDate();
        fillTimelineWithProgress();
        fillHTML();
        console.log("rendered!");
    }
}

function returnEmptyStringIfUndefined(x) {
    if (x == undefined) {
        return x = "";
    } else {
        return x;
    }
}