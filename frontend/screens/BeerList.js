/**
 * Matthias
 * 20/12/2021
 * 
 */

// deactivate the warnings in the app
import { LogBox } from "react-native";
LogBox.ignoreAllLogs(true);

/*Import React*/
import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView } from 'react-native';
/*Icones*/
import Icon from 'react-native-vector-icons/FontAwesome';
// redux
import { useDispatch, useSelector } from 'react-redux';
// composant
import BeerCard from "./BeerCard";
import { useToast, NativeBaseProvider } from 'native-base';

import {IPADRESS} from '../HideData';


export default function BeerList({ navigation }) {

    const dispatch = useDispatch();

    // take everything from the store
    const selectedBrewerie = useSelector(store => store.selectedBrewerie)
    const wishlist = useSelector(store => store.wishlist)
    const token = useSelector(store => store.token)

    const [beers, setBeers] = useState([]);

    const toast = useToast()


    useEffect(() => {
        async function loadData() {
            let request = await fetch(`http://${IPADRESS}:3000/get-beers/${selectedBrewerie._id}`)
            let result = await request.json()
            setBeers(result.beers)
        }
        loadData()
    }, [])


    // when click on a heart
    const addToWishlist = async (beer, isInWishlist) => {

        // make sure the user is connected
        if (token !== '') {
            if (isInWishlist) {
                dispatch({ type: 'addToWishList', beer: beer })
                toast.show({
                    title: "Bière ajoutée dans les favorites !",
                    status: "success",
                    placement: 'top',
                  })
            } else {
                dispatch({ type: 'removeFromWishlist', beer: beer })
                toast.show({
                    title: "Bière retirée des favorites !",
                    status: "danger",
                    placement: 'top',
                  })
            }
            await fetch(`http://${IPADRESS}:3000/users/add-To-Wishlist/${beer._id}/${token}`)
        } else navigation.navigate('StackNav', { screen: 'Log' })
        

    }

    // when click on the 'i' for more info
    const moreInfoBeer = beer => {
        dispatch({ type: 'updateBeer', beerInfo: beer })
        navigation.navigate('BeerInfo')
    }

    // build as many card component as there is beers to show 
    const cards = beers.map((el, i) => {
        let isInWishlist = false;
        wishlist.forEach(e => { if (el._id === e._id) isInWishlist = true })
        return <BeerCard key={i} isInWishlist={isInWishlist} moreInfo={moreInfoBeer} indice={i} beer={el} addToWishlist={addToWishlist} />
    })


    return (
        <NativeBaseProvider>
            <View style={{ backgroundColor: '#194454', flex: 1 }}>
                <View style={styles.topBar} >
                    <Icon onPress={() => {
                        dispatch({ type: 'selectedBrewerie', brewery: '' })
                        navigation.navigate('Homepage');
                    }}
                        style={styles.icon}
                        name="chevron-left"
                        size={30}
                        color="#fff"
                    />
                    <Text style={styles.text}>{selectedBrewerie.name}</Text>
                </View>

                <ScrollView>
                    {cards}
                </ScrollView>
            </View>
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    containerParent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderRadius: 15,
        padding: 30,
        borderColor: '#194454',
        backgroundColor: 'white'
    },
    image: {
        width: 100,
        height: 150,
    },
    containerChildTwo: {
        height: 150,
        justifyContent: 'space-between',
        width: 150,
    },
    texte: {
        color: '#194454',
        fontSize: 20,
    },
    texteType: {
        color: '#194454',
        fontSize: 18,
        width: 150,
    },
    stars: {
        flexDirection: 'row',
    },
    containerChildThree: {
        alignItems: 'center',
        height: 150,
        justifyContent: 'space-between',
    },
    iconeI: {
        color: 'white',
        width: 30,
        textAlign: 'center',
    },
    backgroundIcone: {
        backgroundColor: "#F9D512",
        borderRadius: 50,
    },
    note: {
        color: "#194454",
        fontSize: 25,
        fontWeight: 'bold',
    },
    topBar: {
        width: '100%',
        height: 80,
        backgroundColor: '#194454',
        alignItems: 'center',
        flexDirection: 'row',
    },
    icon: {
        paddingRight: 20,
        paddingLeft: 20,
        marginTop: 35
    },
    text: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 35
    },
});
