`use strict`;

const apiHost = "";
const apiMyRecipes = "/api/recipe/myrecipes";
const apiSavedRecipes = "/api/bookmarks";
const apiDrafts = "/api/drafts/mydrafts";
const apiGetUsers = "/api/usernames?users=";
const recipeViewPageUrl = "/recipe?";
const defaultRecipeImg =
  "https://test-bucket-culinary.s3.amazonaws.com/2987f51efb8dc3b1dcb1de2c3a56b38e.jpeg";
const defaultAuthorImg =
  "https://test-bucket-culinary.s3.amazonaws.com/3387e4c381f682b9f3b2104b0a4433f7.jpg";

//login related varaibles
let userProfile;
let userLoggedIn = false;
let userPremium = false;

//Initial Data required and helper variables
const tagsList = [
  "main-dish",
  "60-minutes-or-less",
  "30-minutes-or-less",
  "weeknight",
  "healthy",
  "low-protein",
  "desserts",
  "15-minutes-or-less",
  "lunch",
  "eggs-dairy",
  "appetizers",
  "american",
  "side-dishes",
];

let tagPicker = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let recipePageNumber = -1;
let recipePageCount = -1;
let searchVal = "";
let searchTypeVal = "";
let apiFetchUrl = "";
let apiSortFetchUrl = "";
let sortEnabled = false;
let searchNameDisplayMsg = "";
let bookmarks = false;

const [tag1, tag2, tag3, tag4, tag5, tag6, tag7] = tagPicker.map(
  (x) => tagsList[x]
);

//helper functions
const buildUrl = function (baseURL, paramsName, paramsValue) {
  let params = new URLSearchParams();
  params.append(paramsName, paramsValue);
  return `${baseURL}${params}`;
};

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

//func to hide/display elements
const hideDisplay = function (ele) {
  ele.classList.add("display-hide");
};
const showDisplay = function (ele) {
  ele.classList.remove("display-hide");
};

//Main navigation Bar
const homeBtn = document.getElementById("home-btn");
const aboutUsBtn = document.getElementById("about-us-btn");
const recipeCreateBtn = document.getElementById("recipe-create-btn");
const loginSignUpBtn = document.getElementById("login-signup-btn");
const accountBtn = document.getElementById("account-btn");

const editProfileForm = document.querySelector(".edit-profile-form");
const editFrmClose = document.getElementById("edit-frm-close");

const updatePwdForm = document.querySelector(".update-password-form");
const updatePwdFormClose = document.getElementById("pwd-frm-close");
const updatePwdErrDisplay = document.getElementById("pwd-err-msg");

const editProfileName = document.getElementById("user-name");
const editProfileBio = document.getElementById("user-bio");
const editProfileImg = document.getElementById("profile-image");
const editProfileSubmitBtn = document.getElementById("profile-update");
const editErrDisplay = document.getElementById("edit-err-msg");

editFrmClose.addEventListener("click", function () {
  hideDisplay(editProfileForm);
});

updatePwdFormClose.addEventListener("click", function () {
  hideDisplay(updatePwdForm);
});

async function prefill_profile_form() {
  editProfileName.value = userProfile.user_name;
  editProfileBio.value = userProfile.bio_info;
}

editProfileSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  complete_update();
});

async function complete_update() {
  var username = editProfileName.value;
  var user_bio = editProfileBio.value;
  console.log("Bio", user_bio);
  var profile_image = editProfileImg.value;
  if (!username) {
    console.log("Username empty");
    editProfileName.focus();
    editErrDisplay.textContent = "Username cannot be empty";
    showDisplay(editErrDisplay);
  } else if (user_bio.length > 300) {
    editProfileBio.focus();
    editErrDisplay.textContent = "Bio length must be less than 100 character";
    showDisplay(editErrDisplay);
  } else if (profile_image) {
    try {
      var image_url = await upload_image_api(editProfileImg);
      var profile_json = {
        user_name: username,
        bio_info: user_bio || userProfile.bio_info,
        profile_image: image_url,
      };
      console.log("Bio", profile_json.bio_info);
      await update_profile_api(profile_json);
      await loginSessionCheck();
      hideDisplay(editErrDisplay);
      hideDisplay(editProfileForm);
    } catch (error) {
      editErrDisplay.textContent = error.message;
      showDisplay(editErrDisplay);
    }
  } else {
    try {
      var profile_json = {
        user_name: username,
        bio_info: user_bio || userProfile.bio_info,
        profile_image: userProfile.profile_image,
      };
      console.log("Bio", profile_json.bio_info);
      await update_profile_api(profile_json);
      await loginSessionCheck();
      hideDisplay(editErrDisplay);
      hideDisplay(editProfileForm);
    } catch (error) {
      editErrDisplay.textContent = error.message;
      showDisplay(editErrDisplay);
    }
  }
}

async function upload_image_api(image_input) {
  let file_data = image_input.files[0];
  let formdata = new FormData();
  formdata.append("image", file_data);
  let options = {
    method: "POST",
    body: formdata,
  };
  let response = await fetch("/api/imageupload", options);
  let rjson = await response.json();
  if (response.ok) {
    return rjson.data.image_url;
  } else {
    throw Error(rjson.message);
  }
}

async function update_profile_api(profile_json) {
  var options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile_json),
  };

  var response = await fetch("/api/profile/edit", options);
  var rjson = await response.json();

  if (!response.ok) {
    throw Error(rjson.message);
  } else {
    return;
  }
}

// Update password section
const updatePwdBtn = document.getElementById("change-password");
const updatePwdPassword = document.getElementById("curr-password");
const updatePwdNewPassword = document.getElementById("new-password");
const updatePwdConfPassword = document.getElementById("new-password-conf");

updatePwdBtn.addEventListener("click", function (e) {
  e.preventDefault();
  // updatePwdErrDisplay.textContent = "Update password clicked";
  // showDisplay(updatePwdErrDisplay);
  change_password();
});

async function change_password() {
  var password = updatePwdPassword.value;
  var new_password = updatePwdNewPassword.value;
  var conf_password = updatePwdConfPassword.value;

  if (!password) {
    updatePwdPassword.focus();
    updatePwdErrDisplay.textContent = "Please enter your current password";
    showDisplay(updatePwdErrDisplay);
  } else if (!new_password) {
    updatePwdNewPassword.focus();
    updatePwdErrDisplay.textContent = "Please enter a new password";
    showDisplay(updatePwdErrDisplay);
  } else if (!conf_password) {
    updatePwdConfPassword.focus();
    updatePwdErrDisplay.textContent = "Please confirm your new password";
    showDisplay(updatePwdErrDisplay);
  } else if (new_password !== conf_password) {
    updatePwdNewPassword.focus();
    updatePwdErrDisplay.textContent = "Passwords do not match";
    showDisplay(updatePwdErrDisplay);
  } else {
    try {
      await update_password_api({
        password: password,
        new_password: new_password,
        verify_password: conf_password,
      });
      updatePwdErrDisplay.textContent = "Successfully updated the password!";
      updatePwdErrDisplay.style.color = "#16a085";
      showDisplay(updatePwdErrDisplay);
      setTimeout(() => {
        hideDisplay(updatePwdForm);
        updatePwdErrDisplay.style.color = "#be2e3a";
      }, 2000);
    } catch (error) {
      console.log(error);
      updatePwdPassword.value =
        updatePwdNewPassword.value =
        updatePwdConfPassword.value =
          "";
      updatePwdPassword.focus();
      updatePwdErrDisplay.textContent = error.message;
      showDisplay(updatePwdErrDisplay);
    }
  }
}

async function update_password_api(pwd_json) {
  var options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pwd_json),
  };

  var response = await fetch("/api/auth/updatepassword", options);
  var rjson = await response.json();
  if (response.ok) {
    return;
  } else {
    throw Error(rjson.message);
  }
}

//func to activate or deactivate main nav buttons
const activMainNavbtn = function (btn) {
  btn.classList.add("nav-link-active");
};
const deactivMainNavbtn = function (btn) {
  btn.classList.remove("nav-link-active");
};

const activSecNavbtn = function (btn) {
  btn.classList.add("nav-btn-active");
};
const deactivSecNavbtn = function (btn) {
  btn.classList.remove("nav-btn-active");
};
//func to setup Main Navigation Bar

accountBtn.addEventListener("click", function (e) {
  window.location.reload();
});

const loginSessionCheck = async function () {
  try {
    let loginCheckRes = await fetch(`${apiHost}/api/myprofile`).then(
      (response) => response.json()
    );

    userLoggedIn = loginCheckRes.success;
    if (!userLoggedIn) throw new Error(loginCheckRes.message);
    ({ data: userProfile } = loginCheckRes);
    userPremium = userProfile.is_premium;
    updateMainNav();
    doProfileDisplay();
  } catch (error) {
    console.log(error.message);
    window.location.href = "/home";
  }
};

const updateMainNav = function () {
  activMainNavbtn(accountBtn);
  if (userLoggedIn) {
    showDisplay(recipeCreateBtn.parentElement);
    showDisplay(accountBtn.parentElement);
    hideDisplay(loginSignUpBtn.parentElement);

    accountBtn.querySelector("#nav-user-img").src = userProfile.profile_image;
    accountBtn.querySelector("#nav-auth-name").textContent =
      userProfile.user_name;

    //setting href
    recipeCreateBtn.setAttribute("href", "/createrecipe");
    accountBtn.setAttribute("href", "/myprofile");
    aboutUsBtn.setAttribute("href", "/about");
    homeBtn.setAttribute("href", "/home");
  } else {
    window.location.href = "/home";
  }
};

const onRelodNavUpdates = function () {
  activMainNavbtn(profileViewBtn);
  showDisplay(recipeDisSec);
  bookmarks = false;
  apiFetchUrl = `${apiHost}${apiMyRecipes}`;
  fetchRecipeBySerch(apiFetchUrl, searchRCardBox, bookmarks);
};
//second nav bar
const profileViewBtn = document.querySelector(".js-sc-nav-btn-1");
const editProfileBtn = document.querySelector(".js-sc-nav-btn-2");
const changePassBtn = document.querySelector(".js-sc-nav-btn-3");
const mngSubBtn = document.querySelector(".js-sc-nav-btn-4");
const logoutBtn = document.querySelector(".js-sc-nav-btn-5");

profileViewBtn.addEventListener("click", function () {
  activMainNavbtn(this);
  deactivMainNavbtn(editProfileBtn);
  deactivMainNavbtn(changePassBtn);
  deactivMainNavbtn(mngSubBtn);
  deactivMainNavbtn(logoutBtn);

  window.location.reload();
});
editProfileBtn.addEventListener("click", function () {
  activMainNavbtn(this);
  deactivMainNavbtn(profileViewBtn);
  deactivMainNavbtn(changePassBtn);
  deactivMainNavbtn(mngSubBtn);
  deactivMainNavbtn(logoutBtn);

  prefill_profile_form();
  showDisplay(editProfileForm);
  hideDisplay(editErrDisplay);
  //rest of the functions
});

changePassBtn.addEventListener("click", function () {
  activMainNavbtn(this);
  deactivMainNavbtn(profileViewBtn);
  deactivMainNavbtn(editProfileBtn);
  deactivMainNavbtn(mngSubBtn);
  deactivMainNavbtn(logoutBtn);

  showDisplay(updatePwdForm);
  hideDisplay(updatePwdErrDisplay);
  //rest of the functions
});
mngSubBtn.addEventListener("click", function () {
  activMainNavbtn(this);
  deactivMainNavbtn(profileViewBtn);
  deactivMainNavbtn(editProfileBtn);
  deactivMainNavbtn(changePassBtn);
  deactivMainNavbtn(logoutBtn);

  //rest of the functions
  window.location.href = "/managesubscription";
});

logoutBtn.addEventListener("click", function () {
  activMainNavbtn(this);
  deactivMainNavbtn(profileViewBtn);
  deactivMainNavbtn(editProfileBtn);
  deactivMainNavbtn(changePassBtn);
  deactivMainNavbtn(mngSubBtn);

  //rest of the functions

  doLogout();
});

let doLogout = function () {
  fetch(`${apiHost}/api/logout`)
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      window.location.href = "/home";
    })
    .catch((error) => console.log("error", error));
};

// User profile section update
const profAuthImg = document.getElementById("prof-auth-img");
const profAuthName = document.getElementById("prof-auth-name");
const profAuthBio = document.getElementById("prof-auth-bio");

const doProfileDisplay = function () {
  profAuthImg.src = userProfile.profile_image;
  profAuthName.textContent = userProfile.user_name;
  profAuthBio.textContent = userProfile.bio_info;
};

//section Navigation update
const myRecipeSecBtn = document.querySelector(".js-sec-nav-1");
const savedSecBtn = document.querySelector(".js-sec-nav-2");
const draftsSecBtn = document.querySelector(".js-sec-nav-3");

myRecipeSecBtn.addEventListener("click", function (e) {
  e.preventDefault();
  activSecNavbtn(this.querySelector(".nav-btn-text"));
  activSecNavbtn(this.querySelector(".nav-btn-highlight"));
  deactivSecNavbtn(savedSecBtn.querySelector(".nav-btn-text"));
  deactivSecNavbtn(savedSecBtn.querySelector(".nav-btn-highlight"));
  deactivSecNavbtn(draftsSecBtn.querySelector(".nav-btn-text"));
  deactivSecNavbtn(draftsSecBtn.querySelector(".nav-btn-highlight"));

  showDisplay(recipeDisSec);

  apiFetchUrl = `${apiHost}${apiMyRecipes}`;
  fetchRecipeBySerch(apiFetchUrl, searchRCardBox);
});
savedSecBtn.addEventListener("click", function (e) {
  e.preventDefault();
  activSecNavbtn(this.querySelector(".nav-btn-text"));
  activSecNavbtn(this.querySelector(".nav-btn-highlight"));
  deactivSecNavbtn(myRecipeSecBtn.querySelector(".nav-btn-text"));
  deactivSecNavbtn(myRecipeSecBtn.querySelector(".nav-btn-highlight"));
  deactivSecNavbtn(draftsSecBtn.querySelector(".nav-btn-text"));
  deactivSecNavbtn(draftsSecBtn.querySelector(".nav-btn-highlight"));

  showDisplay(recipeDisSec);

  apiFetchUrl = `${apiHost}${apiSavedRecipes}`;
  fetchRecipeBySerch(apiFetchUrl, searchRCardBox, true);
});
draftsSecBtn.addEventListener("click", function (e) {
  e.preventDefault();
  activSecNavbtn(this.querySelector(".nav-btn-text"));
  activSecNavbtn(this.querySelector(".nav-btn-highlight"));
  deactivSecNavbtn(myRecipeSecBtn.querySelector(".nav-btn-text"));
  deactivSecNavbtn(myRecipeSecBtn.querySelector(".nav-btn-highlight"));
  deactivSecNavbtn(savedSecBtn.querySelector(".nav-btn-text"));
  deactivSecNavbtn(savedSecBtn.querySelector(".nav-btn-highlight"));

  if (userPremium) {
    showDisplay(recipeDisSec);
    bookmarks = false;
    drafts = true;
    console.log("here");
    apiFetchUrl = `${apiHost}${apiDrafts}`;
    fetchRecipeBySerch(apiFetchUrl, searchRCardBox, bookmarks, drafts);
  } else {
    // alert("This feature is only avilable for premium users");
    searchRCardBox.innerHTML = "";
    let recipeErrorCardHtml = `<a href="/managesubscription" class="recipe-card-btn">
    <div class="recipe-card flex-column">
      
      <!-- ------------------- Recipe content ------------------- -->
      <div class="rc-content-container flex-column ">
      <div class="help-margin-bt-16"></div>
        <div class="rc-title-container">
          <p class="rc-title p-main-semibold">
            This is only for premium subscribers
          </p>
        </div>
        <div class="rc-author-details flex-row">
          
          <p class="rc-auth-name p-main-semibold">
            Click here to subscribe
          </p>
        </div>
        
      </div>
      <!-- ------------------- Recipe Indicator ------------------- -->
      <div class="rc-food-type-indicate rc-noRecipe"></div>
    </div>
    </a>`;
    searchRCardBox.insertAdjacentHTML("afterbegin", recipeErrorCardHtml);

    hideDisplay(loadMoreBtn);
    hideDisplay(loadMoreMsg);
  }
});

//Selecting sections
const recipeDisSec = document.getElementById("my-recipes");

const loadMoreMsg = document.querySelector(".js-load-more-msg");
const loadMoreBtn = document.querySelector(".js-load-more-btn");
const searchRCardBox = document.querySelector(".js-search-rc-box");

loadMoreBtn.addEventListener("click", function (e) {
  let apiFetUrl;
  // if (bookmarks) {
  //   apiFetUrl = `${apiSortFetchUrl}&pageNumber=${recipePageNumber + 1}`;
  // } else {
  //   apiFetUrl = `${apiFetchUrl}&pageNumber=${recipePageNumber + 1}`;
  // }
  apiFetUrl = `${apiFetchUrl}?pageNumber=${recipePageNumber + 1}`;
  fetchRecipeBySerch(apiFetUrl, searchRCardBox, bookmarks);
});

const defAuthorData = {
  user_name: "The Culinary Theory",
  profile_image:
    "https://test-bucket-culinary.s3.amazonaws.com/3387e4c381f682b9f3b2104b0a4433f7.jpg",
};
const defRecipeCardHtml = `<a href="#" class="recipe-card-btn">
<div class="recipe-card flex-column">
  <!-- ------------------- Image ------------------- -->
  <div class="rc-image-container">
    <img
      src="./../img/placeHolderImage.jpeg"
      alt="Photo of food"
      class="rc-food-image"
    />
  </div>
  <!-- ------------------- Recipe content ------------------- -->
  <div class="rc-content-container flex-column">
    <div class="rc-title-container">
      <p class="rc-title p-main-semibold">
        No recipes to display
      </p>
    </div>
    <div class="rc-author-details flex-row">
      <div class="rc-auth-img-container">
        <img
          src="./../img/personPHpreview.jpeg"
          alt="Photo of Author"
          class="rc-auth-image"
        />
      </div>
      <p class="rc-auth-name p-main-semibold">
        The Culinary Theory
      </p>
    </div>
    <div class="rc-action-btns flex-row">
      <div class="rc-action-set flex-row">
        <div class="like-box flex-row">
          <p class="like-count p-main-semibold">0</p>
          <div>
            <span
              class="material-icons-outlined like-icon rc-noRecipe-c"
              >thumb_up</span
            >
            <span
              class="material-icons like-icon icon-inactive icon-filled"
              >thumb_up</span
            >
          </div>
        </div>
        <div class="dislike-box flex-row">
          <p class="dislike-count p-main-semibold">0</p>
          <div>
            <span
              class="material-icons-outlined dislike-icon rc-noRecipe-c"
              >thumb_down</span
            >
            <span
              class="material-icons dislike-icon icon-inactive icon-filled"
              >thumb_down</span
            >
          </div>
        </div>
      </div>
      <div class="rc-action-set flex-row">
        <div class="rc_action_link">
          <span
            class="material-icons-outlined bookmark-icon rc-noRecipe-c"
            >bookmark_outline</span
          >
          <span
            class="material-icons bookmark-icon icon-filled icon-inactive"
            >bookmark</span
          >
        </div>
      </div>
    </div>
  </div>
  <!-- ------------------- Recipe Indicator ------------------- -->
  <div class="rc-food-type-indicate rc-noRecipe"></div>
</div>
</a>`;

const fetchRecipeData = async function (
  apiUrl,
  contentBox,
  search,
  isBookmark,
  isDraft
) {
  try {
    let { data: recipeSetData } = await fetch(apiUrl).then((res) => res.json());
    console.log(recipeSetData);
    if (search) {
      recipePageNumber = recipeSetData.page;
      recipePageCount = recipeSetData.total_pages;
      console.log(recipePageNumber, recipePageCount);
      if (recipePageNumber + 1 === recipePageCount) {
        hideDisplay(loadMoreBtn);
        showDisplay(loadMoreMsg);
      }
    }
    if (!recipeSetData.total_pages) throw new Error(`No Recipes found`);
    let recipesDataArr = recipeSetData.data;
    if (isBookmark) {
      const userIdArr = recipesDataArr.map((recipe) => recipe.user_id);

      const { data: userSetData } = await fetch(
        `${apiHost}${apiGetUsers}${userIdArr.join(",")}`
      ).then((res) => res.json());

      // throw new Error("This is for Testing");
      if (!search || recipePageNumber === 0) contentBox.innerHTML = "";
      recipesDataArr.forEach((recipeData) => {
        let authorData = userSetData[`${recipeData.user_id}`];
        if (!authorData) authorData = defAuthorData;
        renderRecipeCard(recipeData, authorData, contentBox);
      });
    } else {
      if (!search || recipePageNumber === 0) contentBox.innerHTML = "";
      recipesDataArr.forEach((recipeData) => {
        renderRecipeCard(recipeData, null, contentBox, isDraft);
      });
    }
  } catch (e) {
    console.error(e);
    contentBox.innerHTML = "";
    let recipeErrorCardHtml = `<a href="#" class="recipe-card-btn">
    <div class="recipe-card flex-column">
      <!-- ------------------- Image ------------------- -->
      <div class="rc-image-container">
        <img
          src="${defaultRecipeImg}"
          alt="Photo of food"
          class="rc-food-image"
        />
      </div>
      <!-- ------------------- Recipe content ------------------- -->
      <div class="rc-content-container flex-column">
        <div class="rc-title-container">
          <p class="rc-title p-main-semibold">
            ${titleCase(e.message)}
          </p>
        </div>
        <div class="rc-author-details flex-row">
          <div class="rc-auth-img-container">
            <img
              src="${defaultAuthorImg}"
              alt="Photo of Author"
              class="rc-auth-image"
            />
          </div>
          <p class="rc-auth-name p-main-semibold">
            The Culinary Theory
          </p>
        </div>
        <div class="rc-action-btns flex-row">
          <div class="rc-action-set flex-row">
            <div class="like-box flex-row">
              <p class="like-count p-main-semibold">0</p>
              <div>
                <span
                  class="material-icons-outlined like-icon rc-noRecipe-c"
                  >thumb_up</span
                >
                <span
                  class="material-icons like-icon icon-inactive icon-filled"
                  >thumb_up</span
                >
              </div>
            </div>
            <div class="dislike-box flex-row">
              <p class="dislike-count p-main-semibold">0</p>
              <div>
                <span
                  class="material-icons-outlined dislike-icon rc-noRecipe-c"
                  >thumb_down</span
                >
                <span
                  class="material-icons dislike-icon icon-inactive icon-filled"
                  >thumb_down</span
                >
              </div>
            </div>
          </div>
          <div class="rc-action-set flex-row">
            <div class="rc_action_link">
              <span
                class="material-icons-outlined bookmark-icon rc-noRecipe-c"
                >bookmark_outline</span
              >
              <span
                class="material-icons bookmark-icon icon-filled icon-inactive"
                >bookmark</span
              >
            </div>
          </div>
        </div>
      </div>
      <!-- ------------------- Recipe Indicator ------------------- -->
      <div class="rc-food-type-indicate rc-noRecipe"></div>
    </div>
    </a>`;
    contentBox.insertAdjacentHTML("afterbegin", recipeErrorCardHtml);
    if (search) {
      hideDisplay(loadMoreBtn);
      showDisplay(loadMoreMsg);
    }
  }
};

const renderRecipeCard = function (
  recipeData,
  userData,
  contentBox,
  isDraft = false
) {
  let recipeCardHtml;
  if (userData) {
    recipeCardHtml = `<a href="${buildUrl(
      recipeViewPageUrl,
      "recipe_id",
      recipeData.recipe_id
    )}" class="recipe-card-btn">
  <div class="recipe-card flex-column">
    <!-- ------------------- Image ------------------- -->
    <div class="rc-image-container">
      <img
        src="${recipeData.image_url}"
        alt="Photo of food"
        class="rc-food-image"
      />
    </div>
    <!-- ------------------- Recipe content ------------------- -->
    <div class="rc-content-container flex-column">
      <div class="rc-title-container">
        <p class="rc-title p-main-semibold">
        ${titleCase(recipeData.title)}
        </p>
      </div>
      <div class="rc-author-details flex-row">
        <div class="rc-auth-img-container">
          <img
            src="${userData.profile_image}"
            alt="Photo of Author"
            class="rc-auth-image"
          />
        </div>
        <p class="rc-auth-name p-main-semibold">
          ${titleCase(userData.user_name)}
        </p>
      </div>
      <div class="rc-action-btns flex-row">
        <div class="rc-action-set flex-row">
          <div class="like-box flex-row">
            <p class="like-count p-main-semibold">${recipeData.likes}</p>
            <div>
              <span class="material-icons-outlined like-icon"
                >thumb_up</span
              >
              <span
                class="material-icons like-icon icon-inactive icon-filled"
                >thumb_up</span
              >
            </div>
          </div>
          <div class="dislike-box flex-row">
            <p class="dislike-count p-main-semibold">${recipeData.dislikes}</p>
            <div>
              <span class="material-icons-outlined dislike-icon"
                >thumb_down</span
              >
              <span
                class="material-icons dislike-icon icon-inactive icon-filled"
                >thumb_down</span
              >
            </div>
          </div>
        </div>
        <div class="rc-action-set flex-row">
          <div class="rc_action_link">
            <span class="material-icons-outlined bookmark-icon icon-inactive"
              >bookmark_outline</span
            >
            <span
              class="material-icons bookmark-icon icon-filled "
              >bookmark</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="rc-food-type-indicate ${
      recipeData.dietary_preferences === "contains egg"
        ? "rc-egg"
        : recipeData.dietary_preferences === "vegetarian"
        ? "rc-veg"
        : "rc-nonveg"
    }"></div>
  </div>
</a>`;
  } else {
    if (isDraft) {
      recipeCardHtml = `<a href="${`${buildUrl(
        "/editrecipe?",
        "recipe_id",
        recipeData.draft_id
      )}&isDraft=true`}" class="recipe-card-btn">
    <div class="recipe-card flex-column">
      <!-- ------------------- Image ------------------- -->
      <div class="rc-image-container">
        <img
          src="${
            recipeData.image_url !== ""
              ? recipeData.image_url
              : defaultRecipeImg
          }"
          alt="Photo of food"
          class="rc-food-image"
        />
      </div>
      <!-- ------------------- Recipe content ------------------- -->
      <div class="rc-content-container flex-column">
        <div class="rc-title-container">
          <p class="rc-title p-main-semibold">
          ${titleCase(recipeData.title)}
          </p>
        </div>
        <!-- ------------------- Like dislike display ------------------- -->
      </div>
      <div class="rc-food-type-indicate rc-noRecipe"></div>
    </div>
  </a>`;
    } else {
      recipeCardHtml = `<a href="${buildUrl(
        recipeViewPageUrl,
        "recipe_id",
        recipeData.recipe_id
      )}" class="recipe-card-btn">
    <div class="recipe-card flex-column">
      <!-- ------------------- Image ------------------- -->
      <div class="rc-image-container">
        <img
          src="${recipeData.image_url}"
          alt="Photo of food"
          class="rc-food-image"
        />
      </div>
      <!-- ------------------- Recipe content ------------------- -->
      <div class="rc-content-container flex-column">
        <div class="rc-title-container">
          <p class="rc-title p-main-semibold">
          ${titleCase(recipeData.title)}
          </p>
        </div>
        <div class="rc-action-btns flex-row">
          <div class="rc-action-set flex-row">
            <div class="like-box flex-row">
              <p class="like-count p-main-semibold">${recipeData.likes}</p>
              <div>
                <span class="material-icons-outlined like-icon"
                  >thumb_up</span
                >
                <span
                  class="material-icons like-icon icon-inactive icon-filled"
                  >thumb_up</span
                >
              </div>
            </div>
            <div class="dislike-box flex-row">
              <p class="dislike-count p-main-semibold">${
                recipeData.dislikes
              }</p>
              <div>
                <span class="material-icons-outlined dislike-icon"
                  >thumb_down</span
                >
                <span
                  class="material-icons dislike-icon icon-inactive icon-filled"
                  >thumb_down</span
                >
              </div>
            </div>
          </div>
          <div class="rc-action-set flex-row">
          <div class="rc_action_link">
            <div class="material-icons icon-color">
            ${recipeData.is_public ? "visibility" : "visibility_off"}
            
          </div>
          </div>
        </div>
        </div>
      </div>
      <div class="rc-food-type-indicate ${
        recipeData.dietary_preferences === "contains egg"
          ? "rc-egg"
          : recipeData.dietary_preferences === "vegetarian"
          ? "rc-veg"
          : "rc-nonveg"
      }"></div>
    </div>
  </a>`;
    }
  }

  contentBox.insertAdjacentHTML("beforeend", recipeCardHtml);
};

const fetchRecipeBySerch = function (
  apiFetUrl,
  containerBox,
  bookmark = false,
  draft = false
) {
  hideDisplay(loadMoreMsg);
  showDisplay(loadMoreBtn);

  fetchRecipeData(apiFetUrl, containerBox, true, bookmark, draft);
};

const initialCall = function () {
  loginSessionCheck();
  onRelodNavUpdates();
};

initialCall();
