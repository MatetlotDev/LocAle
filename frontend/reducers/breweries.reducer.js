export default function(breweriesList=[], action) {
    if(action.type === 'addLocalBreweries') {
         return action.newBreweries
     }else {
         return breweriesList;
     };
    }    