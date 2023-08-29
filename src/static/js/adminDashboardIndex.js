var currPage=0;
var totalPage=0;
var recipeIds = "";
var fetchAPI = `/api/admin/reports?pageNumber=${currPage}`;
var recipeLink = `/recipe/`;
var reportRecipeMap = {};


var mainContainer = document.getElementById("app");


var cardDiv = document.createElement("div");
mainContainer.appendChild(cardDiv);
cardDiv.classList.add("card-display");

window.onload = logincheck(fetchAPI);

async function logincheck(url){
  document.getElementById("main").style.display = "none";
  var response = await fetch("/api/myprofile");
  var rjson = await response.json();

  if(response.ok){
    document.getElementById("main").style.display = "block";
    document.getElementById("user-name").innerText = rjson.data.user_name;
    document.getElementById("profile-image").src = rjson.data.profile_image;
    JSONFetchFunction(url);
    return false;
  } else {
    var emptyHeader = document.getElementById("emptyHeader");
    emptyHeader.innerText = String(rjson.message);
    document.getElementById("emptyCard").style = "display:block";
    document.getElementById("nav-profile-sec").style.display = "none";
    setTimeout(()=>{
      window.location.href = "/home";
    }, 3000);
    return false;
  }
}

function JSONFetchFunction(url){
    fetch(url, {
      mode: "cors",
      referrerPolicy: "unsafe-url"
    })
      .then(function (response) {
        if(!response.ok)
        {
          return response.json().then(rjson => {
            var emptyHeader = document.getElementById("emptyHeader");
            emptyHeader.innerText = String(rjson.message);
            document.getElementById("emptyCard").style = "display:block";
            console.log("returning from here 2");
            throw Error(rjson.message);
          });
        } else{
          return response.json();
        }
      })
      .then(function (JSONdata) {

        console.log(JSONdata.data.total_pages);
        totalPage = JSONdata.data.total_pages;
        console.log(JSONdata.data);
        if(JSONdata.data.total_count===0)
        {
          document.getElementById("emptyCard").style = "display:block";
          console.log("returning from here1");
          return;
        }

        console.log(`This is total page ${totalPage}`);
        if (currPage === totalPage-1 || totalPage === 0) {
        document.getElementById("loadMore").style = "display:none";
        }

        recipeNameFetch(JSONdata.data, function(err, recipeJSONData){
          if(err)
          {
              var emptyHeader = document.getElementById("emptyHeader");
              emptyHeader.innerText = String(response.statusText);
              document.getElementById("emptyCard").style = "display:block";
              console.log("returning from here");
              return false;
          }
          appendData(JSONdata.data, recipeJSONData);
        });


      })
      .catch(function (err) {
        console.log("error: " + err);
        return;
      });
}


function recipeNameFetch(data, next){
      var len = data.data.length;
      var reports = data.data;
      var recipeIdArray = [];
      for(var i =0;i<len;i++)
      {
        recipeIdArray.push(reports[i].recipe_id);
      }
      recipeIds = String(recipeIdArray);
      var recipeAPI = `/api/recipes?recipe_ids=${recipeIds}`;

      fetch(recipeAPI, {
        mode: "cors",
        referrerPolicy: "unsafe-url"
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (JSONdata) {
          next(false,JSONdata);
        })
        .catch(function (err) {
          next(err);
        });
}


function closeReport(report_id,action)
{
        var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "report_id": String(report_id),
        "action": String(action)
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      fetch("/api/admin/report/close", requestOptions)
        .then(function(response){
          if(response.status===403){
            alert("You must be an admin to perform this action.");
            return;
          }
          return response.json();
        })
        .then(function(result){
          console.log(result);
          const element = document.getElementById(report_id);
          element.style = "display:none";
          if(result.data.closed_count>1)
          {
            window.location.reload();
          }
        })
        .catch(error => console.log('error', error));

      // console.log(x);

}

function deleteReport(report_id,recipe_id)
{

      var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "recipe_id": String(recipe_id),
      "report_id": String(report_id)
    });

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("/api/admin/recipe/delete", requestOptions)
      .then(function(response){
        if(response.status===403){
          alert("You must be an admin to perform this action.");
          return;
        }
      })
      .then(function(result){
        closeReport(report_id,"delete");
      })
      .catch(error => console.log('error', error));
}



var loadMoreButton = document.getElementById("loadMoreButton");
loadMoreButton.addEventListener("click", () => {
  // console.log("Currpage " + String(currPage));
  if(currPage<totalPage-1)
  {
    currPage+=1;
    fetchAPI = `/api/admin/reports?pageNumber=${currPage}`;
    JSONFetchFunction(fetchAPI);
  }
  // callFunc(123);
});




function appendData(data, recipeData) {
      var len = data.data.length;
      var reports = data.data;

      for (var i = 0; i < len; i++)
      {
            reportRecipeMap[String(reports[i].report_id)] = reports[i].recipe_id;

            var div = document.createElement("div");
            div.classList.add("card");
            div.setAttribute("id",reports[i].report_id);

            var recipeImg = document.createElement("div");
            var recipeImgURL = String(recipeLink + `?recipe_id=${reports[i].recipe_id}`);

            recipeImg.innerHTML =
            recipeImg.innerHTML + "<h1>Recipe: </h1>" + `<a href='${recipeImgURL}'>${recipeData.data[reports[i].recipe_id].title}</a>`;
            // "<a href='recipeImgURL'>'recipeData.data[reports[i].recipe_id].title'</a>";


            var reportReason = document.createElement("div");
            reportReason.innerHTML =
              reportReason.innerHTML + "<br><p>Reason: </p>" + reports[i].reason;

            var deleteBtn = document.createElement("div");
            deleteBtn.innerHTML = deleteBtn.innerHTML + "<button>Delete</button>";
            deleteBtn.addEventListener("click", (e) => {
              deleteReport(e.target.parentElement.parentElement.id, reportRecipeMap[e.target.parentElement.parentElement.id]);
            });

            var closeBtn = document.createElement("div");
            closeBtn.innerHTML = closeBtn.innerHTML + "<button>Close</button>";
            closeBtn.addEventListener("click", (e) => {
              closeReport(e.target.parentElement.parentElement.id,"close");
            });

            div.appendChild(recipeImg);
            div.appendChild(reportReason);
            div.appendChild(deleteBtn);
            div.appendChild(closeBtn);

            cardDiv.appendChild(div);
      }

}
