async function logincheck(){
  document.getElementById("subscription-section").style.display = "none";
  var response = await fetch("/api/myprofile");
  var rjson = await response.json();

  if(response.ok){
    document.getElementById("subscription-section").style.display = "block";
    document.getElementById("user-name").innerText = rjson.data.user_name;
    document.getElementById("profile-image").src = rjson.data.profile_image;
    return false;
  } else {
    var emptyHeader = document.getElementById("emptyHeader");
    emptyHeader.innerText = String(rjson.message);
    document.getElementById("emptyCard").style = "display:block";
    document.getElementById("subscription-section").style.display = "none";
    document.getElementById("nav-profile-sec").style.display = "none";
    setTimeout(()=>{
      window.location.href = "/home";
    }, 3000);
    return false;
  }
}


paypal.Buttons({
    createSubscription: function (data, actions) {
        return fetch("/api/gensub", {
          method: "post",
        })
          .then((response) => {
            if (!response.ok) {
                return response.json().then(rjson => {throw Error(rjson.message);});
            }
            return response.json();
          })
          .then((rjson) => rjson.data.id)
          .catch((err)=> {
            var emptyHeader = document.getElementById("emptyHeader");
            emptyHeader.innerText = String(rjson.message);
            document.getElementById("emptyCard").style = "display:block";
          });
        },

        onApprove: function (data, actions) {
            console.log(data);
            var request_data = {
                paypal_id: data.subscriptionID
            }
            return fetch("/api/subscribe", {
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(request_data),
                method: "POST",
              })
                .then((response) => {
                  if (!response.ok) {
                      return response.json().then(rjson => {throw Error(rjson.message);});
                  }
                  return response.json();
                })
                .then((rjson) => {
                  var emptyHeader = document.getElementById("emptyHeader");
                  emptyHeader.innerText = String(rjson.message);
                  document.getElementById("emptyCard").style = "display:block";
                  document.getElementById("emptyCard").style.color = "#32a852";
                    setTimeout(()=>{
                        window.location.href = "/managesubscription"
                    }, 2000)
                })
                .catch((err)=> {
                  console.log("error");
                  document.getElementById("emptyHeader").innerHTML = err.message;
                  document.getElementById("emptyCard").style.display = "block";
                });
          },
}).render("#paypal-button-container");