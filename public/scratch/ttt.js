

var rec = {"dtype":"ref-section","createDate":"2015-08-19T18:18:58.344Z","sectionType":"Vert","sectionOrder":1,
    "jumpItems":[{"title":"a","link":"a","titleDisplay":"a"}],
    "linkItems":[{"title":"a","link":"a","titleDisplay":"a"}],
    "title":"First with Milestone","key":"firstWithMilestone","_id":"SqAoc6332X6HOQMr",
    "milestones":{
    "start":{"date":"2015-08-19T18:18:58.344Z","done":true},
    "tdgrb":{"date":"2015-08-19T18:18:58.344Z","done":true},
    "triage":{"date":"2015-08-19T18:18:58.344Z","done":true},
    "alc":{"date":"2015-08-19T18:18:58.344Z","done":false},
    "etrb":{"date":"2015-08-19T18:18:58.344Z","done":false},
    "release":{"date":"2015-08-19T18:18:58.344Z","done":false}
}
};

u = require('underscore');

var traverse =  function(e, index, list){
    if (index.match(/[Dd]ate/) !== null) {
        console.log("value: " + e + " index/key: " + index);
    }
    if (u.isObject(e)) {
        console.log("IS OBJECT: value: " + e + " index/key: " + index);
        u.each(e,traverse);
    }
    return list;
};

u.each(rec,traverse);


u.each(rec,
         function(e, index, list){
             console.log(
                 "value: " + e + " index/key: " + index + " list: " +
                 list + " Array: " + u.isArray(e) + " Is Object " + u.isObject(e))
             return list;
         });

