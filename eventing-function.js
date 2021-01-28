function OnUpdate(doc, meta) {
    log("document", doc);
    if(doc._type === "locationRegistration"){
        if(doc["checkout"]){
            log("We have a checkedout person", doc);
            if(doc.infected){
                log("person has been infected")
                findPossibleTraces(doc)
            }
        }
    }
    
}

function findPossibleTraces(doc) {
    log("Finding possible infections")
    
    var doc_checkin = doc.checkin;
    var doc_checkout = doc.checkout;
    var doc_phone = doc.phone;
    
    var possible_infected_visitors = 
        SELECT phone, checkin, checkout
        FROM `track-and-tracers`._default._default
        WHERE checkin >= $doc_checkin AND checkin <= $doc_checkout;
        
    for(var person of possible_infected_visitors) {
        log("Person who might be infected", person)
    }
}

function OnDelete(meta, options) {
    log("Doc deleted/expired", meta.id);
}