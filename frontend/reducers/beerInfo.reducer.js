export default function(beerInfo = {}, action){
    if(action.type === 'updateBeer') {
        return action.beerInfo
    }
    else if(action.type === 'addBeerNote'){
        const beer = {...beerInfo}
        beer.notes.unshift(action.note)
        return beer
    }
    else return beerInfo
}