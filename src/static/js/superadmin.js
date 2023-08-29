var emailAPI = `/api/admin/getuser?query_user=`;
var updateAPI = `/api/admin/updaterole`;

async function logincheck(){
    document.getElementById("main").style.display = "none";
    var response = await fetch("/api/issuperadmin");
    var rjson = await response.json();

    if(response.ok){
        var response = await fetch("/api/myprofile");
        var rjson = await response.json()

        if (response.ok){
            document.getElementById("main").style.display = "block";
            document.getElementById("user-name").innerText = rjson.data.user_name;
            document.getElementById("profile-image").src = rjson.data.profile_image;
            return false;
        } else {
            var emptyHeader = document.getElementById("emptyHeader");
            emptyHeader.innerText = String(rjson.message);
            document.getElementById("emptyCard").style = "display:block";
            document.getElementById("main").style.display = "none";
            document.getElementById("nav-profile-sec").style.display = "none";
            setTimeout(()=>{
                window.location.href = "/home";
            }, 3000);
            return false;
    
        }

    } else {
    var emptyHeader = document.getElementById("emptyHeader");
    emptyHeader.innerText = String(rjson.message);
    document.getElementById("emptyCard").style = "display:block";
    document.getElementById("main").style.display = "none";
    document.getElementById("nav-profile-sec").style.display = "none";
    setTimeout(()=>{
        window.location.href = "/home";
    }, 3000);
    return false;
    }
}

  function getUser(e)
  {
    document.getElementById("emptyCard").style = "display:none";
    e.preventDefault();
    var emailAPI2 = emailAPI;
    emailAPI2+=encodeURIComponent(document.getElementById("email").value);

    fetch(emailAPI2,{
      mode: "cors",
      referrerPolicy: "unsafe-url"
    })
      .then(function(response){
        return response.json();
      })
      .then(function(result){
        if(result){
          console.log(result);
          if(result.data.role=="user"){
            var display = document.getElementById("user-text");
            display.innerHTML = `<li>Email: ${result.data.email}</li> <li>Role: ${result.data.role}`;
            document.getElementById("userdisplay").style = "display:block";
            document.getElementById("demote").style = "display:none";
            document.getElementById("promote").style = "display:block";
            document.getElementById("promote").onclick = function(){
              promoteUser(result.data.email, "admin");
            }
          }
          else{
            var display = document.getElementById("user-text");
            display.innerHTML = `<li>Email: ${result.data.email}</li> <li>Role: ${result.data.role}`;
            document.getElementById("userdisplay").style = "display:block";
            var button = document.getElementById("demote");
            button.style = "display:block";
            document.getElementById("promote").style = "display:none";
            // document.getElementById("demote").style = "display:block";
            document.getElementById("demote").onclick = function(){
              demoteUser(result.data.email, "user");
            };
            
          }
        }
      })
      .catch(function(error){
        // console.log("error");
      });
  }

  function promoteUser(email, role)
  {
    document.getElementById("promote").style = "display:block";

          var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
          "target_user": String(email),
          "target_role": String(role)
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("/api/admin/updaterole", requestOptions)
          .then(function(response){
            if (!response.ok){
                if(response.status !== 500){
                    return response.json().then((rjson)=>{throw Error(rjson.message)});
                }
                else {
                    throw Error("Something went wrong");
                }
            }
            else {
                return response.json();
            }
          })
          .then(function(result){
            var emptyHeader = document.getElementById("emptyHeader");
            emptyHeader.innerText = String(result.message);
            document.getElementById("emptyCard").style = "display:block";
            document.getElementById("emptyCard").style.color = "#32a852";
            document.getElementById("userdisplay").style.display = "none"
            document.getElementById("user-text").innerHTML = ""
          })
          .catch(error =>{
            var emptyHeader = document.getElementById("emptyHeader");
            emptyHeader.innerText = String(error.message);
            document.getElementById("emptyCard").style = "display:block";
            document.getElementById("emptyCard").style.color = "#ed3949";
          });
  }

  function demoteUser(email, role)
  {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "target_user": String(email),
      "target_role": String(role)
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("/api/admin/updaterole", requestOptions)
      .then(function(response){
        if (!response.ok){
            if(response.status !== 500){
                return response.json().then((rjson)=>{throw Error(rjson.message)});
            }
            else {
                throw Error("Something went wrong");
            }
        }
        else {
            return response.json();
        }
      })
      .then(function(result){
        var emptyHeader = document.getElementById("emptyHeader");
        emptyHeader.innerText = String(result.message);
        document.getElementById("emptyCard").style = "display:block";
        document.getElementById("emptyCard").style.color = "#32a852";
        document.getElementById("userdisplay").style.display = "none"
        document.getElementById("user-text").innerHTML = ""
      })
      .catch(error =>{
        var emptyHeader = document.getElementById("emptyHeader");
        emptyHeader.innerText = String(error.message);
        document.getElementById("emptyCard").style = "display:block";
        document.getElementById("emptyCard").style.color = "#ed3949";
      });
  }