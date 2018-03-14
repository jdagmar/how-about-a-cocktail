
/* form elements */
const input = document.getElementById('input');
const searchValue = input.value;
const checkbox = document.getElementById('non-alcoholic');
const searchForm = document.getElementById('search-form');
const invalidInputMessage = document.getElementById('invalid-input-message');
const searchButtonText = document.getElementById('search-button-text');
const searchButton = document.getElementById('search-button');

/* content containers */
const contentDescription = document.getElementById('content-description');
const drinkContainer = document.getElementById('drink-container');
const drinkList = document.getElementById('drink-list');
const listView = document.getElementById('list-view');
const singleView = document.getElementById('single-view');

/* buttons */
const backToListButton = document.getElementById('back-to-list-button');
const randomDrinkButton = document.getElementById('random-drink-button');

/* states */
const cacheTimeSeconds = 60 * 10;
let searchMode = false;
let randomDrinkMode = true;

const loadingSpinner = document.getElementById('loading-spinner');

/* simulates the feeling of switching between pages */
const toggleView = view => {
    if (view === 'list') {
        listView.classList.remove('hidden');
        singleView.classList.add('hidden');
        contentDescription.classList.remove('hidden');
    }
    if (view === 'single') {
        singleView.classList.remove('hidden');
        listView.classList.add('hidden');
    }
}

const fetchNonAlcoholicList = () => {
    return fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic`)
        .then(response => response.json());
}

const fetchDrinkByIngredient = searchWord => {
    // controls that for example GIN and gin only results in one cache
    const formatedSearchword = searchWord.trim().toLowerCase();
    const localStorageKey = `searchedIngredient:${formatedSearchword}`;
    const cachedSearchResult = localStorage.getItem(localStorageKey);

    // if theres cached information use that instead of fetching 
    if (cachedSearchResult) {
        const data = JSON.parse(cachedSearchResult);

        const secondsSinceCached = (Date.now() - data.timeStamp) / 1000;
        // if our cache is less than 10 minutes old return solved promise 
        if (secondsSinceCached < cacheTimeSeconds) {
            return Promise.resolve(JSON.parse(cachedSearchResult));
        }
    }

    return fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${formatedSearchword}`)
        .then(response => response.text())
        .then(text => {
            /* if user searches for a drink this fetch won't resolve since theres no ingredient 
            named eg. tom collins, so if this is the case we return empty drinks so we can continue */
            if (text.length > 0) {
                return JSON.parse(text);
            } else {
                return { drinks: [] };
            }
        })
        .then(data => {
            // to control how long cached result is saved current date is sent in
            data.timeStamp = Date.now();
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            return data;
        });
}

const fetchDrinkByDrinkName = searchWord => {
    const formatedSearchword = searchWord.trim().toLowerCase();
    const localStorageKey = `searchedDrinkName:${formatedSearchword}`;
    const cachedSearchResult = localStorage.getItem(localStorageKey);

    if (cachedSearchResult) {
        const data = JSON.parse(cachedSearchResult);

        const secondsSinceCached = (Date.now() - data.timeStamp) / 1000;
        // if our cache is less than 10 minutes old return solved promise 
        if (secondsSinceCached < cacheTimeSeconds) {
            return Promise.resolve(JSON.parse(cachedSearchResult));
        }
    }

    return fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${formatedSearchword}`)
        .then(response => response.json())
        .then(data => {
            if (data.drinks === null) {
                return { drinks: [] };
            } else {
                return data;
            }
        })
        .then(data => {
            data.timeStamp = Date.now();
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            return data;
        });
}

/* check if user input doest not just contains blank spaces */
const isValidInput = searchWord => {
    if (!searchWord.trim()) {
        return false;
    }
    return true;
}

const searchForDrink = searchWord => {
    // if user just submits blank spaces the searchfunction wont excecute
    if (!isValidInput(searchWord)) {
        invalidInputMessage.classList.remove('invisible');
        return;
    }

    invalidInputMessage.classList.add('invisible');
    loadingSpinner.classList.remove('hidden');
    searchButton.setAttribute('disabled', 'disabled');
    searchButtonText.classList.add('hidden');

    // if all promises are resolved we continue
    Promise.all([
        fetchNonAlcoholicList(),
        fetchDrinkByIngredient(searchWord),
        fetchDrinkByDrinkName(searchWord)
    ])
        .then(result => {
            const nonAlcholicData = result[0];
            const drinkIngredientsData = result[1];
            const drinkNamesData = result[2];
            const nonAlcoholicDrinkIds = [];

            // saving all id's of the non-alcoholic drinks
            for (const drink of nonAlcholicData.drinks) {
                nonAlcoholicDrinkIds.push(drink.idDrink);
            }

            // list of all drinks to display
            const filtered = [];
            const filteredId = [];

            // goes through all drinknames
            for (const drink of drinkNamesData.drinks) {
                /* if user has chosen 'only show non-alcoholic' check if theres a matching 
                drinkid in our list of non-alcoholic drinks or if user wants both */
                if ((checkbox.checked && nonAlcoholicDrinkIds.indexOf(drink.idDrink) > -1)
                    || !checkbox.checked) {

                    filtered.push(drink);
                    filteredId.push(drink.idDrink);
                }
            }

            // checks if theres a match in the drinkingredientlist
            for (const drink of drinkIngredientsData.drinks) {
                if ((checkbox.checked && nonAlcoholicDrinkIds.indexOf(drink.idDrink) > -1)
                    || !checkbox.checked) {

                    if (filteredId.indexOf(drink.idDrink) === -1) {
                        filtered.push(drink);
                        filteredId.push(drink.idDrink);
                    }
                }
            }

            // for some reason the catch on line 177 wont work its controlled here
            if (filtered.length === 0) {
                contentDescription.innerText = `
                    Nothing found on ${searchWord}.
                `;
            }

            searchMode = true;
            randomDrinkMode = false;
            loadingSpinner.classList.add('hidden');
            searchButton.removeAttribute('disabled', 'disabled');
            searchButtonText.classList.remove('hidden');
            displayDrink(filtered, 'list');
        })
        .catch(error => {
            console.error(error);
            loadingSpinner.classList.add('hidden');
            searchButton.removeAttribute('disabled', 'disabled');
            searchButtonText.classList.remove('hidden');
            contentDescription.innerText = 'Something went wrong, try again.';
        });
}

/* when searching for ingredient/name the recipe/instructions isn't included in
the returned object so another fetch is made here */
const getDrink = id => {
    searchMode = true;
    randomDrinkMode = false;

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => response.json())
        .then(data => {
            displayDrink(data.drinks, 'single');
        })
        .catch(error => {
            console.error(error);
            contentDescription.innerText = 'Something went wrong, try again.';
        });
}

const getRandomDrink = () => {
    fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
        .then(response => response.json())
        .then(data => {
            displayDrink(data.drinks, 'single');
        })
        .catch(error => {
            console.error(error);
            contentDescription.innerText = 'Something went wrong, try again.';
        });
}

const displayDrink = (drinks, type) => {
    if (type === 'list') {
        drinkList.innerHTML = '';
    }

    for (const drink of drinks) {
        // display for a indvidual drink
        if (type === 'single') {
            const drinkTitle = singleView.querySelector('.drink-title');

            toggleView('single');

            // if user has used the searchfield a 'back to search list' button is displayed
            if (searchMode) {
                // since flex is has higher specificity in tailwind we need to toggle flex instead
                backToListButton.classList.add('flex');
            } else {
                backToListButton.classList.remove('flex');
            }

            /* if user has used the searchfield but only used 'random drink button' 
            the drink title is instead used as a part of a headline */
            if (randomDrinkMode) {
                contentDescription.innerText = `How about a ${drink.strDrink}?`;
                drinkTitle.classList.add('hidden');
            } else {
                contentDescription.classList.add('hidden');
                drinkTitle.classList.remove('hidden');
            }

            const drinkImage = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}"/>
            `;

            const measureArray = [];
            const ingredientsArray = [];
            const drinksProperties = Object.keys(drink);

            /* the json object does not return a array with all ingredients/measures so
            its manually done here */
            for (const drinkProperty of drinksProperties) {
                if (drinkProperty.includes('strIngredient')) {
                    ingredientsArray.push(drink[drinkProperty]);
                } else if (drinkProperty.includes('strMeasure')) {
                    measureArray.push(drink[drinkProperty]);
                }
            }

            let drinkIngredients = '';

            for (let i = 0; i < ingredientsArray.length; i++) {
                const ingredient = ingredientsArray[i];
                const measures = measureArray[i];

                if (ingredient && ingredient.trim()) {
                    drinkIngredients += `
                        <li class="list-reset mb-2">${measures} ${ingredient}</li>
                    `;
                }
            }

            const drinkInstructionsContainer = singleView.querySelector('#drink-instructions');
            const drinkImageContainer = singleView.querySelector('.drink-image-container');
            const drinkIngredientsContainer = singleView.querySelector('#drink-ingredients');
            const drinkInstructions = drink.strInstructions;
            const drinkInfo = drink.strDrink;

            drinkTitle.innerHTML = drinkInfo;
            drinkImageContainer.innerHTML = drinkImage;
            drinkIngredientsContainer.innerHTML = drinkIngredients;
            drinkInstructionsContainer.innerHTML = drinkInstructions;
        }

        // display when search results is listed
        if (type === 'list') {
            toggleView('list');

            if (searchMode) {
            }

            contentDescription.innerText = `Showing search result(s) for ${input.value}:`;

            const drinkId = drink.idDrink;
            const searchResult = drinkContainer.cloneNode(true);
            const imageContainerItem = searchResult.querySelector('.drink-image-container');

            // each listitem becomes clickable and when clicked the full recipe is fetched
            searchResult.addEventListener('click', () => {
                getDrink(drinkId);
            });

            const drinkImageList = `
                    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}"/>
                `;

            imageContainerItem.innerHTML = drinkImageList;

            const searchResultTitle = searchResult.querySelector('.drink-title');
            searchResultTitle.innerText = drink.strDrink;

            drinkList.appendChild(searchResult);
        }

    }

}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const searchValue = input.value;
    searchForDrink(searchValue);
});

randomDrinkButton.addEventListener('click', () => {
    getRandomDrink();
});

backToListButton.addEventListener('click', () => {
    toggleView('list');
});

getRandomDrink();