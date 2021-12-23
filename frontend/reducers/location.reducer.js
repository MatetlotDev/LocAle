export default function(location = {}, action){
    if(action.type === 'userLocalisation'){

        return {latitude: action.location.coords.latitude, longitude: action.location.coords.longitude}
    } 
    else return location
}