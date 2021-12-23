export default function(selectedBrewerie = '', action){
    if(action.type === 'selectedBrewerie') return action.brewery
    else return selectedBrewerie
}