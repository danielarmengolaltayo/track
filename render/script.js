/////////////////// global variables

const urlParams = new URLSearchParams(window.location.search);
const userA = urlParams.get('userA');
const userB = urlParams.get('userB');
const form = urlParams.get('form');

/////////////////// config airtable

// keys
const key = urlParams.get('key'); //API key
// var airtableApiKey = location.hash.substring(1); //add the apiKey at the end of the url (..index.html#apiKey)
// if (airtableApiKey == "") { alert("AIRTABLE_API_KEY is missing (..index.html#apiKey)"); } // error message
var airtableBaseKey = "appaGvmsLzxTrLLh7";

// base
var airtableBaseNameA = userA;
var airtableBaseNameB = userB;

// view
var airtableViewName = "Grid view";

// records
var a = [];
var b = [];

// retrieving data from airtable
var Airtable = require('airtable');
var base = new Airtable({ apiKey: key }).base(airtableBaseKey);

var loadA = false;
var loadB = false;

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

/////////////////// variables

var initDate;
var t = [];

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

function mergeMultipleEntriesForTheSameDate() {
    // for (var i = 0; i < a.length; i++) {
    //     console.log("array pre " + a[i].what + " " + a[i].when);
    // }
    for (var i = 1; i < a.length; i++) {
        if (a[i].when.isSame(a[i - 1].when)) {
            a[i - 1].what = a[i - 1].what + "\n" + a[i].what;
            a.splice(i, 1);
            i--;
        }
    }
    // for (var i = 0; i < a.length; i++) {
    //     console.log("array post " + a[i].what + " " + a[i].when);
    // }
    for (var i = 1; i < b.length; i++) {
        if (b[i].when.isSame(b[i - 1].when)) {
            b[i - 1].what = b[i - 1].what + "\n" + b[i].what;
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
    //header with usernames
    header.innerHTML = "<div class='left'>" + userA + "</div><div class='date'></div><div class='right'>" + "Your progress" + "</div>";
    for (var i = 0; i < t.length; i++) {
        //check if undefined and substitute it with an empty string
        if (!t[i].a) {
            t[i].a = "";
        }
        if (!t[i].b) {
            t[i].b = "";
        }
        records.innerHTML = records.innerHTML + "<div class='record'><div class='left'>" + t[i].a + "</div><div class='date'>" + t[i].d.format('YYYY/MM/DD') + "</div><div class='right'>" + t[i].b + "</div></div>";
    }
}

function addLinkForm() {
    var add = document.getElementById("add");
    add.innerHTML = "<div class='left'></div><div class='date'></div><div class='right'><a href='https://airtable.com/" + form + "' target='_blank'>What progress have you made today?</a></div>";
}

function render() {
    if (loadA == true && loadB == true) {
        sortByDate();
        getInitialDate();
        createTimeline();
        mergeMultipleEntriesForTheSameDate();
        fillTimeline();
        fillHTML();
        addLinkForm();
        document.getElementById('add').scrollIntoView();
        // var content = getListOfRecords();
        // left.innerHTML = left.innerHTML + content.left;
        // right.innerHTML = right.innerHTML + content.right;
        console.log("rendered!");
    }
}


/*

*/
