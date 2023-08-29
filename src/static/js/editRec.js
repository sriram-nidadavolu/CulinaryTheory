`use strict`;
const apiHost = "";
// //////////////////////////////////////////////////////////////////
//header and page start related code.
let userProfile;
let userLoggedIn = false;
let userPremium = false;
let reciptObj;

//Main navigation Bar
const homeBtn = document.getElementById("home-btn");
const aboutUsBtn = document.getElementById("about-us-btn");
const recipeCreateBtn = document.getElementById("recipe-create-btn");
const loginSignUpBtn = document.getElementById("login-signup-btn");
const accountBtn = document.getElementById("account-btn");

//func to activate or deactivate main nav buttons
const activMainNavbtn = function (btn) {
  btn.classList.add("nav-link-active");
};
const deactivMainNavbtn = function (btn) {
  btn.classList.remove("nav-link-active");
};

//func to setup Main Navigation Bar

// recipeCreateBtn.addEventListener("click", function (e) {
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
    console.log(userPremium, userProfile);
    updateMainNav();
    onLoadUisetup();
  } catch (error) {
    console.log(error.message);
    window.location.href = "/home";
  }
};

const updateMainNav = function () {
  deactivMainNavbtn(homeBtn);
  deactivMainNavbtn(aboutUsBtn);
  deactivMainNavbtn(recipeCreateBtn);
  deactivMainNavbtn(loginSignUpBtn);
  deactivMainNavbtn(accountBtn);
  // activMainNavbtn(recipeCreateBtn);
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
const headerTitle = document.querySelector(".header-title");
const saveDraftApi = function () {
  objecBuild(true);
  console.log(reciptObj);
};
const onLoadUisetup = function () {
  if (isDraft) {
    headerTitle.textContent = "Edit your Draft Recipe";
    saveBtns.forEach((x) => {
      x.classList.remove("btn-not-active", "display-hide");
      x.addEventListener("click", (e) => e.preventDefault());
      x.addEventListener("click", saveDraftApi);
    });
    document
      .querySelector(".posting-type-box")
      .classList.remove("input-field-disabled");

    inpPosting.forEach((x) => (x.disabled = false));
  } else {
    headerTitle.textContent = "Edit your recipe";
    saveBtns.forEach((x) => {
      x.classList.add("btn-not-active", "display-hide");
      x.addEventListener("click", (e) => e.preventDefault());
      x.removeEventListener("click", saveDraftApi);
    });
    document
      .querySelector(".posting-type-box")
      .classList.add("input-field-disabled");
    inpPosting.forEach((x) => (x.disabled = false));
    inpPosting[0].checked = true;
  }
};
// //////////////////////////////////////////////////////////////////
//Form related code.
//form UI related
//Navigating tabs
let title = false;
let titleVal;
let image = false;
let imageVal;
let description = false;
let descriptionVal;
let ingredients = false;
let ingredientsVal;
let steps = false;
let stepsVal;
let prepTime = false;
let prepTimeVal;
let cuisine = false;
let cuisineVal;
let preferences = false;
let preferencesVal;
let tags = false;
let tagsVal;
let posting = true;
let postingVal;

const inpTitle = document.getElementById("recipe-title");
const inpImage = document.getElementById("recipe-image");
const inpDesc = document.getElementById("recipe-description");
const inpPrepTime = document.getElementById("prep-time");
const inpCuisine = document.getElementById("cuisine-type");
const inpPreferences = document.getElementsByName("radio");
const inpTags = document.getElementById("recipe-tags");
const inpPosting = document.getElementsByName("radio1");

const saveBtns = document.querySelectorAll(".btn-save");
const formNavBar = document.querySelector(".form-nav-bar");
const formNavBtns = document.querySelectorAll(".form-nav-btn");

const activateFormNavBtn = function (formNavbtn) {
  formNavBtns.forEach((btn) => {
    [...btn.children].forEach((child) =>
      child.classList.remove("nav-btn-active")
    );
  });
  [...formNavbtn.children].forEach((child) =>
    child.classList.add("nav-btn-active")
  );
};
const allFormSecs = document.querySelectorAll(".section-cr-form");
const showAsec = function (section) {
  allFormSecs.forEach((sec) => hideDisplay(sec));
  showDisplay(section);
};
formNavBar.addEventListener("click", function (e) {
  e.preventDefault();
  let clickBtn = e.target.closest(".form-nav-btn");
  if (!clickBtn) return;
  activateFormNavBtn(clickBtn);
  showAsec(document.getElementById(clickBtn.dataset.secname));
});

const btnNext = document.querySelectorAll(".btn-next");
btnNext.forEach((nxt) => {
  nxt.addEventListener("click", function (e) {
    e.preventDefault();
    activateFormNavBtn(document.getElementById(nxt.dataset.btnname));
    showAsec(document.getElementById(nxt.dataset.secname));
  });
});

const btnPrev = document.querySelectorAll(".btn-prev");
btnPrev.forEach((prev) => {
  prev.addEventListener("click", function (e) {
    e.preventDefault();
    activateFormNavBtn(document.getElementById(prev.dataset.btnname));
    showAsec(document.getElementById(prev.dataset.secname));
  });
});

// /////////////////////////////////
//adding direction input boxes
const formStepContainer = document.getElementById("form-dir-step-container");
formStepContainer.addEventListener("click", function (e) {
  e.preventDefault();
  let clickBtn = e.target;
  if (clickBtn.classList.contains("delete-step")) {
    let currStep = Number(clickBtn.dataset.stepNumber);
    let tempStepBox = formStepContainer.querySelector(`.step-${currStep}`);
    tempStepBox.remove();
    console.log(currStep);
  } else if (clickBtn.classList.contains("add-step")) {
    let currStep = Number(clickBtn.dataset.stepNumber);
    let tempStepBox = formStepContainer.querySelector(`.step-${currStep}`);
    hideDisplay(tempStepBox.querySelector(".add-step"));
    showDisplay(tempStepBox.querySelector(".delete-step"));
    let nextStep = currStep + 1;
    let stepAddHtml = `<div class="fields-side flex-row steps-box step-${nextStep}">
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-large step"
      placeholder="Enter your step here"
      required
    />

    <div
      class="material-icons form-btn-icon delete-step display-hide"
      data-step-number="${nextStep}"
    >
      do_not_disturb_on
    </div>
    <div
      class="material-icons form-btn-icon add-step"
      data-step-number="${nextStep}"
    >
      add_circle
    </div>
  </div>`;
    formStepContainer.insertAdjacentHTML("beforeend", stepAddHtml);
  } else {
    return;
  }
});

// /////////////////////////////////
//adding ingrediants input boxes
const formIngContainer = document.getElementById("form-ingredient-container");
formIngContainer.addEventListener("click", function (e) {
  let clickBtn = e.target;
  if (clickBtn.classList.contains("delete-ingredient")) {
    let currStep = Number(clickBtn.dataset.ingredientNumber);
    let tempStepBox = formIngContainer.querySelector(`.ingredient-${currStep}`);
    tempStepBox.remove();
    console.log(currStep);
  } else if (clickBtn.classList.contains("add-ingredient")) {
    let currStep = Number(clickBtn.dataset.ingredientNumber);
    let tempStepBox = formIngContainer.querySelector(`.ingredient-${currStep}`);
    hideDisplay(tempStepBox.querySelector(".add-ingredient"));
    showDisplay(tempStepBox.querySelector(".delete-ingredient"));
    let nextStep = currStep + 1;
    let ingAddHtml = `<div
    class="fields-side flex-row ingredients-box ingredient-${nextStep}"
  >
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-medium ing-name"
      placeholder="Enter Ingredient name here"
      required
    />
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-small ing-quan"
      placeholder="Enter Quantity and Matric"
      required
    />
    <div
      class="material-icons form-btn-icon delete-ingredient display-hide"
      data-ingredient-number="${nextStep}"
    >
      do_not_disturb_on
    </div>
    <div
      class="material-icons form-btn-icon add-ingredient"
      data-ingredient-number="${nextStep}"
    >
      add_circle
    </div>
  </div>`;
    formIngContainer.insertAdjacentHTML("beforeend", ingAddHtml);
  } else {
    return;
  }
});
///////////////////////
// getting recipe through api call
function getRecipeId() {
  let params = new URLSearchParams(window.location.search);
  return params.get("recipe_id");
}
function findIsDraft() {
  let params = new URLSearchParams(window.location.search);

  return params.get("isDraft") === "true" ? true : false;
}
const recipe_id = getRecipeId();
const isDraft = findIsDraft();
// console.log(recipe_id);
// console.log(isDraft);

async function getEditRecipe(recipe_id) {
  try {
    let response = await fetch("/api/recipe/" + recipe_id);
    let rjson = await response.json();
    if (response.ok) {
      console.log(rjson);
      recipeJson = rjson.data;
      renderInput(rjson.data);

      // uiUpdate();
      return rjson;
    } else {
      //some error or recipe not found.
      throw Error(rjson.message);
    }
  } catch (error) {
    console.log(error);
  }
}

async function getDraftRecipe(recipe_id) {
  try {
    let response = await fetch("api/draft/" + recipe_id);
    let rjson = await response.json();
    if (response.ok) {
      console.log(rjson);
      recipeJson = rjson.data;
      renderInput(rjson.data);
      return rjson;
    } else {
      throw new Error(rjson.message);
    }
  } catch (error) {
    console.log(error.message);
  }
}
const getRecipeData = function (recipe_id) {
  if (isDraft) {
    getDraftRecipe(recipe_id);
  } else {
    getEditRecipe(recipe_id);
  }
};

getRecipeData(recipe_id);

/////////////////////////////////////
// rendering Recipe in to input fields
let preExitingImage;
function renderInput(data) {
  inpTitle.value = data.title;
  preExitingImage = data.image_url;
  inpDesc.value = data.description;

  renderIngrediants(data.ingredients);

  renderSteps(data.steps);
  inpPrepTime.value = data.prep_time;
  inpCuisine.value = data.cuisine;
  if (data.dietary_preferences === "vegetarian") {
    inpPreferences[0].checked = true;
  } else if (data.dietary_preferences === "nonvegetarian") {
    inpPreferences[1].checked = true;
  } else if (data.dietary_preferences === "contains egg") {
    inpPreferences[2].checked = true;
  } else {
    inpPreferences[0].checked = false;
    inpPreferences[1].checked = false;
    inpPreferences[2].checked = false;
  }

  inpTags.value = data.tags.join(", ");
  inpPosting[data.is_public ? 0 : 1].checked = true;
}

function renderIngrediants(data) {
  formIngContainer.innerHTML = "";
  if (data.length != 0) {
    data.forEach((ingData, ind, ingArra) => {
      let ingAddHtml;
      if (ind !== ingArra.length - 1) {
        ingAddHtml = `<div
    class="fields-side flex-row ingredients-box ingredient-${ingData.ingre_no}"
  >
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-medium ing-name"
      placeholder="Enter Ingredient name here"
      value="${ingData.ingredient}"
      required
    />
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-small ing-quan"
      placeholder="Enter Quantity and Matric"
      value="${ingData.quantity}"
      required
    />
    <div
      class="material-icons form-btn-icon delete-ingredient "
      data-ingredient-number="${ingData.ingre_no}"
    >
      do_not_disturb_on
    </div>
    <div
      class="material-icons form-btn-icon add-ingredient display-hide"
      data-ingredient-number="${ingData.ingre_no}"
    >
      add_circle
    </div>
  </div>`;
      } else {
        ingAddHtml = `<div
    class="fields-side flex-row ingredients-box ingredient-${ingData.ingre_no}"
  >
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-medium ing-name"
      placeholder="Enter Ingredient name here"
      value="${ingData.ingredient}"
      required
    />
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-small ing-quan"
      placeholder="Enter Quantity and Matric"
      value="${ingData.quantity}"
      required
    />
    <div
      class="material-icons form-btn-icon delete-ingredient display-hide"
      data-ingredient-number="${ingData.ingre_no}"
    >
      do_not_disturb_on
    </div>
    <div
      class="material-icons form-btn-icon add-ingredient "
      data-ingredient-number="${ingData.ingre_no}"
    >
      add_circle
    </div>
  </div>`;
      }
      formIngContainer.insertAdjacentHTML("beforeend", ingAddHtml);
    });
  } else {
    let ingAddHtml = `<div
    class="fields-side flex-row ingredients-box ingredient-${1}"
  >
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-medium ing-name"
      placeholder="Enter Ingredient name here"
      required
    />
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-small ing-quan"
      placeholder="Enter Quantity and Matric"
      required
    />
    <div
      class="material-icons form-btn-icon delete-ingredient display-hide"
      data-ingredient-number="${1}"
    >
      do_not_disturb_on
    </div>
    <div
      class="material-icons form-btn-icon add-ingredient"
      data-ingredient-number="${1}"
    >
      add_circle
    </div>
  </div>`;
    formIngContainer.insertAdjacentHTML("beforeend", ingAddHtml);
  }
}

function renderSteps(data) {
  formStepContainer.innerHTML = "";
  if (data.length != 0) {
    data.forEach((step, ind, stepArra) => {
      let stepAddHtml;
      if (ind != stepArra.length - 1) {
        stepAddHtml = `<div class="fields-side flex-row steps-box step-${step.step_no}">
        <input
          type="text"
          class="input-box h-5-main-semibold input-box-large step"
          placeholder="Enter your step here"
          value="${step.step}"
          required
        />
    
        <div
          class="material-icons form-btn-icon delete-step "
          data-step-number="${step.step_no}"
        >
          do_not_disturb_on
        </div>
        <div
          class="material-icons form-btn-icon add-step display-hide"
          data-step-number="${step.step_no}"
        >
          add_circle
        </div>
      </div>`;
      } else {
        stepAddHtml = `<div class="fields-side flex-row steps-box step-${step.step_no}">
        <input
          type="text"
          class="input-box h-5-main-semibold input-box-large step"
          placeholder="Enter your step here"
          value="${step.step}"
          required
        />
    
        <div
          class="material-icons form-btn-icon delete-step display-hide "
          data-step-number="${step.step_no}"
        >
          do_not_disturb_on
        </div>
        <div
          class="material-icons form-btn-icon add-step "
          data-step-number="${step.step_no}"
        >
          add_circle
        </div>
      </div>`;
      }
      formStepContainer.insertAdjacentHTML("beforeend", stepAddHtml);
    });
  } else {
    let stepAddHtml = `<div class="fields-side flex-row steps-box step-${1}">
    <input
      type="text"
      class="input-box h-5-main-semibold input-box-large step"
      placeholder="Enter your step here"
      required
    />

    <div
      class="material-icons form-btn-icon delete-step display-hide"
      data-step-number="${1}"
    >
      do_not_disturb_on
    </div>
    <div
      class="material-icons form-btn-icon add-step"
      data-step-number="${1}"
    >
      add_circle
    </div>
  </div>`;
    formStepContainer.insertAdjacentHTML("beforeend", stepAddHtml);
  }
}

// /////////////////////////////////
//form back end
const getTitleAndDes = function () {
  title = image = description = true;
  titleVal = inpTitle.value;
  if (titleVal === "") title = false;
  imageVal = inpImage.value;
  if (imageVal === "") image = false;
  descriptionVal = inpDesc.value;
  if (descriptionVal === "") description = false;
};

const getAdditionalInfo = function () {
  prepTime = cuisine = preferences = tags = posting = true;
  prepTimeVal = inpPrepTime.value;
  if (prepTimeVal === "") prepTime = false;
  cuisineVal = inpCuisine.value;
  if (cuisineVal === "") cuisine = false;
  for (i = 0; i < inpPreferences.length; i++) {
    if (inpPreferences[i].checked) {
      preferencesVal = inpPreferences[i].value;
      preferences = true;
      break;
    } else {
      preferences = false;
    }
  }
  tagsVal = inpTags.value;
  tagsVal = tagsVal.split(",");
  if (tagsVal.length < 5 || tagsVal.length > 10) tags = false;
  if (userPremium) {
    for (i = 0; i < inpPosting.length; i++) {
      if (inpPosting[i].checked) {
        postingVal = inpPosting[i].value === "public" ? true : false;
        posting = true;
        break;
      }
    }
  } else {
    postingVal = posting = true;
  }
};

const ingrediantsData = function () {
  ingredients = true;
  let ingredBoxArr = formIngContainer.querySelectorAll(".ingredients-box");
  let tempIngred = [...ingredBoxArr].map((box, i) => {
    let ingObj = {
      ingre_no: i + 1,
      ingredient: box.querySelector(".ing-name").value,
      quantity: box.querySelector(".ing-quan").value,
    };
    return ingObj;
  });
  tempIngred.forEach((x) => {
    if (!x.ingredient || !x.quantity) ingredients = false;
  });
  return tempIngred;
};

const stepsData = function () {
  steps = true;
  let stepsBoxArr = formStepContainer.querySelectorAll(".steps-box");
  let tempStep = [...stepsBoxArr].map((box, i) => {
    let stpObj = {
      step_no: i + 1,
      step: box.querySelector(".step").value,
    };
    return stpObj;
  });
  tempStep.forEach((x) => {
    if (!x.step) steps = false;
  });
  return tempStep;
};
async function uploadFile() {
  let fileinput = inpImage;
  let file_data = fileinput.files[0];
  let formdata = new FormData();
  formdata.append("image", file_data);
  let options = {
    method: "POST",
    // headers: { "Content-Type": "multipart/form-data" },
    body: formdata,
  };
  let response = await fetch("/api/imageupload", options);
  let rjson = await response.json();
  if (response.ok) {
    imageVal = rjson.data.image_url;
    return true;
  } else {
    alert("image upload failed");
    return false;
  }
}

const objecBuild = async function (isDraftData = false, isSubmitted = false) {
  getTitleAndDes();
  if (image === true) {
    image = await uploadFile();
  } else {
    imageVal = preExitingImage;
    image = true;
  }
  ingredientsVal = ingrediantsData();
  stepsVal = stepsData();
  getAdditionalInfo();
  if (isDraftData) {
    if (isSubmitted) {
      if (
        !title
          ? displayError("please fill title")
          : !image
          ? displayError("upload image again")
          : !description
          ? displayError("please fill description")
          : !ingredients
          ? displayError("Please fill ingredients")
          : !steps
          ? displayError("Plesae fill the steps")
          : !prepTime
          ? displayError("pleae fill prep time")
          : !cuisine
          ? displayError("please enter cuisine")
          : !preferences
          ? displayError("please check the preferences")
          : !tags
          ? displayError("Please enter between 5 to 10 tags")
          : true
      ) {
        reciptObj = {
          title: titleVal,
          description: descriptionVal,
          image_url: imageVal,
          tags: tagsVal,
          steps: stepsVal,
          ingredients: ingredientsVal,
          dietary_preferences: preferencesVal,
          prep_time: prepTimeVal,
          cuisine: cuisineVal,
          is_public: postingVal,
        };

        let options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reciptObj),
        };

        let response = await fetch("/api/recipe/create", options);
        let rjson = await response.json();
        if (response.ok) {
          let options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ draft_id: recipe_id }),
          };
          fetch("/api/draft/delete", options);
          displayError(rjson.message, false);
          setTimeout(() => {
            console.log(rjson.data);
            window.location.href = `/recipe?recipe_id=${rjson.data.recipe_id}`;
          }, 2000);
          return;
        } else {
          displayError(rjson.message);
          return;
        }
      } else {
        return false;
      }
    } else {
      if (!title ? displayError("please fill title") : true) {
        reciptObj = {
          title: titleVal,
          description: descriptionVal,
          image_url: imageVal,
          tags: tagsVal,
          steps: stepsVal,
          ingredients: ingredientsVal,
          dietary_preferences: preferencesVal,
          prep_time: prepTimeVal,
          cuisine: cuisineVal,
          is_public: postingVal,
          draft_id: recipe_id,
        };

        var options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reciptObj),
        };

        var response = await fetch("/api/draft/edit", options);
        var rjson = await response.json();
        if (response.ok) {
          displayError(rjson.message, false);
          setTimeout(() => {
            console.log(rjson.data);
            window.location.href = `/myprofile`;
          }, 2000);
          return;
        } else {
          displayError(rjson.message);
          return;
        }
      } else {
        return false;
      }
    }
  } else {
    if (
      !title
        ? displayError("please fill title")
        : !image
        ? displayError("upload image again")
        : !description
        ? displayError("please fill description")
        : !ingredients
        ? displayError("Please fill ingredients")
        : !steps
        ? displayError("Plesae fill the steps")
        : !prepTime
        ? displayError("pleae fill prep time")
        : !cuisine
        ? displayError("please enter cuisine")
        : !preferences
        ? displayError("please check the preferences")
        : !tags
        ? displayError("Please enter between 5 to 10 tags")
        : true
    ) {
      reciptObj = {
        title: titleVal,
        description: descriptionVal,
        image_url: imageVal,
        tags: tagsVal,
        steps: stepsVal,
        ingredients: ingredientsVal,
        dietary_preferences: preferencesVal,
        prep_time: prepTimeVal,
        cuisine: cuisineVal,
        is_public: postingVal,
        recipe_id: recipe_id,
      };

      var options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reciptObj),
      };

      var response = await fetch("/api/recipe/edit", options);
      var rjson = await response.json();
      if (response.ok) {
        displayError(rjson.message, false);
        setTimeout(() => {
          console.log(rjson.data);
          window.location.href = `/recipe?recipe_id=${rjson.data.recipe_id}`;
        }, 2000);
        return;
      } else {
        displayError(rjson.message);
        return;
      }
    } else {
      return false;
    }
  }
};

const submi = document.querySelector(".btn-sub");
submi.addEventListener("click", function (e) {
  e.preventDefault();
  if (isDraft) {
    objecBuild(true, true);
    console.log(reciptObj);
  } else {
    objecBuild();
    console.log(reciptObj);
  }
});
// //////////////////////////////////////////////////////////////////
//helper functions
const hideDisplay = function (ele) {
  ele.classList.add("display-hide");
};
const showDisplay = function (ele) {
  ele.classList.remove("display-hide");
};

// //////////////////////////////////////////////////////////////////
//pop-up & over-lays
//error pop-up
const errorPopup = document.getElementById("error-popup");
errorPopup.addEventListener("click", function (e) {
  if (e.target.classList.contains("err-cls-btn")) hideDisplay(errorPopup);
});
const displayError = function (errMessage, iserr = true) {
  if (iserr) {
    errorPopup.style.backgroundColor = "#be2e3a";
  } else {
    errorPopup.style.backgroundColor = "#16a085";
  }
  showDisplay(errorPopup);
  errorPopup.firstElementChild.textContent = errMessage;
  setTimeout(() => hideDisplay(errorPopup), 5000);
  return false;
};
// /////////////////////////////////

// //////////////////////////////////////////////////////////////////
//pageLoad-functions
loginSessionCheck();
