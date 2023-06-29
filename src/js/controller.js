import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// import 'core-js/stable';
// import 'regenerator-runtime/runtime';


// if(module.hot){
//   module.hot.accept();
// }

const contorlRecipes = async function () {
  try{
    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();


    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    //1) Load Spinner/ Recipe
    await model.loadRecipe(id);

    //2) Rendering Recipe
    recipeView.render(model.state.recipe);

  } catch(err){
    recipeView.renderError()
  }
}


const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner()
    //1. get search query
    const query = searchView.getQuery();
    if(!query) return;

    //2.Load search results
    await model.loadSearchResults(query);

    //3. Render results
    resultsView.render(model.getSearchResultsPage());

    //4. Render initial Pagination buttons
    paginationView.render(model.state.search);

  }catch(err){
    console.log(err);
  }
}

const controlPagination = function(goToPage){
      //1. Render results
      resultsView.render(model.getSearchResultsPage(goToPage));

      //2. Render initial Pagination buttons
      paginationView.render(model.state.search);
}

const controlServings = function(newServings){
  //update recipe servings (in state)
  model.updateServings(newServings);
  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}

const controlAddBookmark = function(){
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
}

const controlBookamarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  try{

    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage('Recipe successfully uploaded!');

    bookmarksView.render(model.state.bookmarks);


    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function(){
      addRecipeView.toggleWindow()
    },2500);

  }catch(error){
    console.log(error)
    addRecipeView.renderError(error);
  }

  //function to upload new handler data.
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookamarks);
  recipeView.addHandlerRender(contorlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();