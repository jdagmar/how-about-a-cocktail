const input = document.getElementById('input');
const searchForm = document.getElementById('search-form');

const refreshButton = document.getElementById('refresh-button');

const searchForDrink = (searchWord) => {

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchWord}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            displayDrink(data.drinks);

        })
        .catch((error) => {
            console.log('error', error)
        });
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchValue = input.value;
    searchForDrink(searchValue);
})

const getRandomDrink = () => {
    fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            displayDrink(data.drinks);

        })
        .catch((error) => {
            console.log('error', error)
        });
}

const displayDrink = (drinks) => {

    for (const drink of drinks) {

        const drinkTitle = document.getElementById('drink-title');
        const drinkImageContainer = document.getElementById('drink-image-container');
        const drinkIngredientsContainer = document.getElementById('drink-ingredients');

        let drinkInfo = `
                <p>${drink.strDrink}</p>
            `;

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
                <p>${measures} ${ingredient}</p>
            `;

        }

        const drinkInstructionsContainer = document.getElementById('drink-instructions');

        let drinkInstructions = `
                <p>${drink.strInstructions}</p>
            `;

        drinkTitle.innerHTML = drinkInfo;
        drinkImageContainer.innerHTML = drinkImage;
        drinkIngredientsContainer.innerHTML = drinkIngredients;
        drinkInstructionsContainer.innerHTML = drinkInstructions;
    }

}

refreshButton.addEventListener('click', () => {
    getRandomDrink();
})




