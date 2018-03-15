# How about a cocktail?
made by Jessica Gustavsson

## Links
* [Test the application here](https://jdagmar.github.io/how-about-a-cocktail/)
* [See github repo here](https://github.com/jdagmar/how-about-a-cocktail)

## About 
How about a cocktail? is a application where you get cocktail suggestions and search for cocktails based on ingredient, drink name and wether you want non-alcoholic or both.

## Building tools
* [Tailwind CSS](https://tailwindcss.com/)
* JavaScript

### Resources
I've used theCocktailDB's API which is an open database with cocktail recipes including images and information on ingredients used. [See API here](https://www.thecocktaildb.com/).

## Workflow
Firstly i implemented the function to get random drinks. Then I continued with the searchfunction.
First i made sure user could search for drink by ingredient, then by name and lastly implemented the checkbox so user could filter by non-alcoholic.

### Improvements
If possible I would like to...
* Find a way to only fetch images that are 300x300 instead of 700x700.
* Make sure that users who navigate by keyboard will be able to write in inputfield, check the checkbox and then back to submit button smoothly.
* Make sure that the search results (image gallery) can be accessed with keyboard.
* Save the scroll position so when user clicks a drink in listview and then back the scrollpostion remains the same.