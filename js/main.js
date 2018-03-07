const input = document.getElementById('input');
const searchForm = document.getElementById('search-form');

const drinkContainer = document.getElementById('drink-div');
const drinkList = document.getElementById('drink-list');

const backToSearchResults = document.getElementById('back-to-search-results');
const refreshButton = document.getElementById('refresh-button');

const contentDescription = document.getElementById('content-description');

const mainView = document.getElementById('main-view');
const singleView = document.getElementById('single-view');

const toggleView = (view) => {

    if (view === 'main') {
        mainView.classList.remove('hidden');
        singleView.classList.add('hidden');
    }

    if (view === 'single') {
        singleView.classList.remove('hidden');
        mainView.classList.add('hidden');
    }

}

// radiobuttons
const radioButtons = document.querySelector('alcohol');

// the value of the radio goes here
const radioButtonValue = '';

const searchForDrink = (searchWord) => {

    // first take the value from the inputfield
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchWord}`)
        .then((response) => response.json())
        .then((data) => {

            // check if the radio buttons is checked
            // for (const i = 0; i < radioButtons.length; i++) {
            //     if (radioButtons[i].checked) {
            //         radioButtonValue = radioButtons;
            //         break;
            //     }
            // }

            // if one is checked, make another fetch
            // if (radioButtonValue.checked) {

            //     const filterByAlcohol = (radioButtonValue) => {
            //         fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${alcohol}`)
            //             .then((response) => response.json())
            //             .then((data) => {

            //                 /* then we should match the drink ids from the first
            //                     fetch with the matching id in the second fetch */

            //             })
            //     }

            // }

            // display search result
            toggleView('main');
            displayDrink(data.drinks, 'list');

        })
        .catch((error) => {
            contentDescription.innerText = `
                We're sorry but we couldn't find a drink containing '${input.value}'.
            `;
        });
}

const searchForDrinkIngredients = (id) => {
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then((response) => response.json())
        .then((data) => {
            displayDrink(data.drinks, 'single');
        })
        .catch((error) => {
            contentDescription.innerText = `
                Seems like something went wrong, we couldn't find the recipe
                for ${data.drinks.strDrink}.
            `;
        });
}

const getRandomDrink = () => {
    fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
        .then((response) => response.json())
        .then((data) => {
            displayDrink(data.drinks, 'single');
        })
        .catch((error) => {
            contentDescription.innerText = `
                We're sorry, no recipe is aviable right now.
            `;
        });
}

const displayDrink = (drinks, type) => {

    if (type === 'list') {
        drinkList.innerHTML = '';
    }

    for (const drink of drinks) {

        // display when random drink
        if (type === 'single') {

            toggleView('single');

            const drinkTitle = singleView.querySelector('#drink-title');
            const drinkImageContainer = singleView.querySelector('#drink-image-container');
            const drinkIngredientsContainer = singleView.querySelector('#drink-ingredients');

            let drinkInfo = drink.strDrink;

            let drinkImage = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}"/>
            `;

            let measureArray = [];
            let ingredientsArray = [];
            let drinksProperties = Object.keys(drink);

            for (const drinkProperty of drinksProperties) {
                if (drinkProperty.includes('strIngredient')) {

                    if (drink[drinkProperty] !== null) {
                        ingredientsArray.push(drink[drinkProperty]);
                    }
                }

                if (drinkProperty.includes('strMeasure')) {
                    measureArray.push(drink[drinkProperty]);
                }
            }

            let drinkIngredients = '';

            for (let i = 0; i < ingredientsArray.length; i++) {

                const ingredient = ingredientsArray[i];
                const measures = measureArray[i];

                drinkIngredients += `
                    <li class="list-reset mb-2">${measures} ${ingredient}</li>
                `;

            }

            const drinkInstructionsContainer = singleView.querySelector('#drink-instructions');

            let drinkInstructions = drink.strInstructions;

            drinkTitle.innerHTML = drinkInfo;
            drinkImageContainer.innerHTML = drinkImage;
            drinkIngredientsContainer.innerHTML = drinkIngredients;
            drinkInstructionsContainer.innerHTML = drinkInstructions;
        }

        // display when search
        if (type === 'list') {

            contentDescription.innerText = `Search result(s) for '${input.value}':`;

            const searchResult = drinkContainer.cloneNode(true);
            const imageContainerItem = searchResult.querySelector('#drink-image-container');
            const drinkId = drink.idDrink;

            searchResult.addEventListener('click', () => {
                searchForDrinkIngredients(drinkId);
            });

            let drinkImageList = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}"/>
            `;

            imageContainerItem.innerHTML = drinkImageList;

            const searchResultTitle = searchResult.querySelector('.drink-title');
            searchResultTitle.innerText = drink.strDrink;

            drinkList.appendChild(searchResult);

        }

    }

}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchValue = input.value;
    searchForDrink(searchValue);
});

refreshButton.addEventListener('click', () => {
    getRandomDrink();
});

backToSearchResults.addEventListener('click', () => {
    toggleView('main');
})
