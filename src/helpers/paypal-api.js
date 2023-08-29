const config = require('../config/config')

const { CLIENT_ID, APP_SECRET } = process.env;
const base = config.paypal.base_url;

function generate_token(next){
    console.log("In generate access token2");
    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
    fetch(`${base}/v1/oauth2/token`, {
        method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    }
    }).then((response) => {
        console.log("Token request completed");
        if (response.status === 200 || response.status === 201) {
            response.json().then((rjson)=>{
                console.log("got resp json");
                return next(false, rjson.access_token);
            });
          }
        else{
            response.text().then(function(errorMessage){
                next(new Error(errorMessage));
            });
        }
    });
}

exports.create_subscription = function(plan_id, name, email, start_date, next){
    generate_token(function(err, access_token){
        if(err){
            console.log("Unable to generate paypal access token");
            return next(err);
        }
        const url = `${base}/v1/billing/subscriptions`;

        if (!start_date){
            var start_time = new Date(new Date().getTime() + 30 * 60000);
        } else{
            var start_time = start_date;
        }
        start_time.setMilliseconds(0);
        start_time = start_time.toISOString().replace(".000Z", "Z");

        var subscription_body = config.paypal.subscription_body;
        subscription_body.start_time = start_time;
        subscription_body.plan_id = plan_id;
        subscription_body.subscriber.email = email;
        subscription_body.subscriber.name.given_name = name;

        fetch(url, {
            method: "post",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify(subscription_body),
        }).then(function(response){

            if (response.status == 200 || response.status == 201){
                response.json().then(function(rjson){
                   return next(false, rjson); 
                });
            } else {
                response.text().then(function(errorMessage){
                   return next(new Error(errorMessage), null);
                });
            }
        });
    });
}

exports.get_subscription = function(id, next){
    generate_token(function(err, access_token){
        if(err){
            console.log("Unable to generate paypal access token");
            return next(err);
        }
        const url = `${base}/v1/billing/subscriptions/${id}`;
        fetch(url, {
            method: "get",
            headers: {
            Authorization: `Bearer ${access_token}`,
            },
        }).then(function(response){
            console.log("Got subscription details");
            if (response.status == 200 || response.status == 201){
                response.json().then(function(rjson){
                    console.log("Got subscription json");
                    return next(false, rjson);
                });
            } else {
                response.text().then(function(errorMessage){
                    return next(new Error(errorMessage), null);
                 });
            }
        });
    });
}

exports.cancel_subscription = function(id, cancel_reason, next){
    generate_token(function(err, access_token){
        if(err){
            console.log("Unable to generate paypal access token");
            return next(err);
        }
        const url = `${base}/v1/billing/subscriptions/${id}/cancel`;
        fetch(url, {
            method: "post",
            headers: {
            "Content-Type": 'application/json',
            Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                "reason": cancel_reason,
            })
        }).then(function(response){
            if (response.status == 200 || response.status == 201 || response.status == 204){
                    return next(false);
            } else {
                response.text().then(function(errorMessage){
                    return next(new Error(errorMessage));
                 });
            }
        });
    })
}
