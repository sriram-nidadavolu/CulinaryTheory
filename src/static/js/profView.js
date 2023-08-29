`use strict`;

const apiHost = "";
const apiMyRecipes = "/api/recipe/user/";
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

let recipePageNumber = -1;
let recipePageCount = -1;
let searchVal = "";
let searchTypeVal = "";
let apiFetchUrl = "";
let apiSortFetchUrl = "";
let sortEnabled = false;
let searchNameDisplayMsg = "";
let bookmarks = false;

function getAuthorId() {
  let params = new URLSearchParams(window.location.search);
  return params.get("user_id");
}
const author_id = getAuthorId();

async function getSingleUser(user_id) {
  return await fetch(`${apiHost}${apiGetUsers}${user_id}`).then((res) =>
    res.json()
  );
}

let authorProfile;

const getAuthorProfile = async function () {
  // console.log(await getSingleUser(author_id));
  let { data: authResData } = await getSingleUser(author_id);
  console.log(authResData);
  authorProfile = authResData[`${author_id}`];
  console.log(authorProfile);
};

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

//195-270

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

// accountBtn.addEventListener("click", function (e) {
//   window.location.reload();
// });

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
    await getAuthorProfile();
    doProfileDisplay();
  } catch (error) {
    console.log(error.message);
    window.location.href = "/home";
  }
};

const updateMainNav = function () {
  deactivMainNavbtn(accountBtn);
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
  // activMainNavbtn(profileViewBtn);
  showDisplay(recipeDisSec);
  bookmarks = false;
  apiFetchUrl = `${apiHost}${apiMyRecipes}${author_id}`;
  fetchRecipeBySerch(apiFetchUrl, searchRCardBox, bookmarks);
};
// //second nav bar

// User profile section update
const profAuthImg = document.getElementById("prof-auth-img");
const profAuthName = document.getElementById("prof-auth-name");
const profAuthBio = document.getElementById("prof-auth-bio");

const doProfileDisplay = function () {
  console.log(authorProfile);
  profAuthImg.src = authorProfile.profile_image;
  profAuthName.textContent = authorProfile.user_name;
  profAuthBio.textContent = authorProfile.bio_info;
};

//Selecting sections
const recipeDisSec = document.getElementById("my-recipes");

const loadMoreMsg = document.querySelector(".js-load-more-msg");
const loadMoreBtn = document.querySelector(".js-load-more-btn");
const searchRCardBox = document.querySelector(".js-search-rc-box");

loadMoreBtn.addEventListener("click", function (e) {
  let apiFetUrl;
  apiFetUrl = `${apiFetchUrl}?pageNumber=${recipePageNumber + 1}`;
  fetchRecipeBySerch(apiFetUrl, searchRCardBox, false);
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
