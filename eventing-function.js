function OnUpdate(doc, meta) {
    if(doc._type === "locationRegistration"){
        if(doc["location"]) {
            if(doc["checkin"]){
                if(!doc["checkout"]) {
                    increment_venue_guest(doc);
                }
            }
            if(doc["checkout"]){
                if(!doc["checkedOut"]) {
                    decrement_venue_guest(doc);
                }
                if(doc.infected){
                    findPossibleTraces(doc);
                }
            }
        }
    }
    
}

function venue_full_call_police(location) {
    //rest call to the police
    log("location is full: ", location);
}

function increment_venue_guest(doc) {
    
    
    //log("incrementing guests at: ", doc.location)
    var location_doc = tnt[doc.location];
    
    log("Current venue guests:", location_doc.guests)
    if(location_doc.guests < location_doc.maxGuests) {
        //log("guests incremented")
        location_doc.guests = location_doc.guests + 1;
    }
    else {
        // venue is full, call the police
        venue_full_call_police(doc.location);
    }
    
    //log("Local guests:", location_doc.guests);
    
    tnt[doc.location] = location_doc;
    //log("updated the location doc");


    log("setting checkout")
    var doc_to_edit = tnt[doc];
    doc_to_edit["checkedOut"] = false;
    tnt[doc] = doc_to_edit;
    log("checkout set", tnt[doc])
    
    //log("location guests in cb: ", tnt[doc.location].guests);
    
    //log("location doc local:", location_doc);
    //log("location doc couchbase:", tnt[doc.location]);
}

function decrement_venue_guest(doc) {
    log("DECREMENTING")
    var location_doc = tnt[doc["location"]];
    log("decrementing from: ", location_doc.guests);
    location_doc["guests"] = location_doc["guests"]-1;
    log("decrementation complete: ", location_doc.guests)
    tnt[doc["location"]] = location_doc;
    log("location guests in cb: ", tnt[doc.location].guests);
    
    var doc_to_edit = tnt[doc];
    doc_to_edit["checkedOut"] = true;
    tnt[doc] = doc_to_edit;
}

function findPossibleTraces(doc) {
    
    var doc_checkin = doc.checkin;
    var doc_checkout = doc.checkout;
    var doc_phone = doc.phone;
    var doc_location = doc.location;
    
    var possible_infected_visitors = 
        SELECT meta().id, phone, checkin, checkout
        FROM `track-and-tracers`
        WHERE ((checkin >= $doc_checkin AND checkin <= $doc_checkout) 
            OR (checkout >= $doc_checkin AND checkout <= $doc_checkout))
            AND location = $doc_location
            AND phone != $doc_phone;

    for(var person of possible_infected_visitors) {
        notify_via_sms(person);
    }
    
    log("Updating the infections doc");
    var location_doc = tnt[doc.location];
    log("Infections doc:", location_doc);
    location_doc.infections = location_doc.infections + 1;
    log("new infections", location_doc.infections);
    tnt[doc.location] = location_doc;
    
}

function notify_via_sms(doc) {
    log("Person might be infected, notifying", doc)
    UPDATE `track-and-tracers` USE KEYS [$doc.id] SET notified = true;
}

function OnDelete(meta, options) {
    log("Doc deleted/expired", meta.id);
}
