export default function (wishlist = [], action) {
    if(action.type === 'updateWishlist') return action.wishlist
    else if(action.type === 'addToWishList') {
        const newW = [...wishlist, action.beer]
        return newW
    }else if(action.type === 'removeFromWishlist'){
        let newW = [...wishlist];
        newW = newW.filter(e => e._id !== action.beer._id)
        return newW
    }

    else return wishlist
}