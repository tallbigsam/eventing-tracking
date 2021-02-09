function OnUpdate(doc, meta) {

    if(doc.type != "covidSuspectedUser") return;
    if(doc.infected == false) return;
    
    var documentIdToBeUpdated = "covidcase::" + doc.state + "::" + doc.createDate;
    
    var documentToBeUpdated = SELECT track_and_trace.* FROM track_and_trace USE KEYS [$documentIdToBeUpdated];
    
    for(var i of documentToBeUpdated){

       var incPositive = parseInt(i.positive) + 1;
       var incPositiveIncrease = parseInt(i.positiveIncrease) + 1;
       
       i.positive = incPositive + "";
       i.positiveIncrease = incPositiveIncrease + "";
    
       targetBucket[documentIdToBeUpdated] = i;
    }
}

function OnDelete(meta, options) {
}
