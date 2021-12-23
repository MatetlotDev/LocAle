/**
 * Matthias
 * 20/12/2021
 * 
 */

// imports
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import BeerCard from './BeerCard';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'native-base';

import { IPADRESS } from '../HideData';


export default function Wishlist({ navigation }) {

    const dispatch = useDispatch();

    const token = useSelector(store => store.token);
    const wishlist = useSelector(store => store.wishlist);

    const toast = useToast();

    // same as in profile, make sure to redirect
    useFocusEffect(
        React.useCallback(() => {
            if (token.length === 0) navigation.navigate('StackNav', { screen: 'Log' });

            return () => {/* nothing happen, just to remember */ }
        }, [token])
    )

    // if (token === '') navigation.navigate('StackNav', { screen: 'Log' })

    // when click on heart in the wishlist
    const moveFromWishlist = async (beer) => {
        toast.show({
            title: "Bière retirée des favorites !",
            status: "danger",
            placement: 'top',
        })

        dispatch({ type: 'removeFromWishlist', beer: beer })
        await fetch(`http://${IPADRESS}:3000/users/add-To-Wishlist/${beer._id}/${token}`)
    }

    // when click on 'i' for more infos
    const moreInfoBeer = async (beer) => {
        const request = await fetch(`http://${IPADRESS}:3000/get-beer/${beer._id}`)
        const result = await request.json()

        dispatch({ type: 'updateBeer', beerInfo: result })
        navigation.navigate('BeerInfo')
    }

    // create cards beer
    const cards = wishlist.map((el, i) => {
        let isInWishlist = true;
        return <BeerCard key={i} isInWishlist={isInWishlist} moreInfo={moreInfoBeer} indice={i} beer={el} addToWishlist={moveFromWishlist} />
    })

    // if no beer iis liked yet
    if (wishlist.length === 0) return (
        <View style={{ backgroundColor: '#194454', flex: 1 }}>
            <View style={styles.topBar} >
                <Text style={styles.text}>Mes Favorites</Text>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 0.8 }}>
                <Text style={{ fontSize: 20, color: "#fff", margin: 20 }}>Pas encore de bières favorites ?</Text>
                <Text
                    onPress={() => navigation.navigate('StackNav', { screen: 'Homepage' })}
                    style={{ color: 'lightblue' }}
                >Découvrir les bières autour de moi.</Text>
            </View>
        </View>
    )
    else return (
        <View style={{ backgroundColor: '#194454', flex: 1 }}>
            <View style={styles.topBar} >
                <Text style={styles.text}>Mes Favorites</Text>
            </View>

            <ScrollView>
                {cards}
            </ScrollView>
        </View>
    )
}

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
        justifyContent: 'center',
    },
    icon: {
        padding: 20,
    },
    text: {
        fontSize: 25,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 35
    },
})