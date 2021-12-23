/**
 * Matthias
 * 20/12/2021
 * 
 */

// imports
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import IconI from 'react-native-vector-icons/AntDesign';


export default function BeerCard(props) {

    let isInWishlist = props.isInWishlist; // to set the color of the heart red or yellow
    let color = isInWishlist ? '#A15640' : '#F9D512'

    // played every time user click on a heart
    const manageWishlist = () => {
        props.addToWishlist(props.beer, !isInWishlist); // play the same function in the parent
        color === '#A15640' ? color = '#F9D512' : color = '#A15640';
    }

    // function that return a function to write for loop in jsx
    const starByNote = s => s()

    // play the same function in the parent component 
    const moreInfoBeer = beer => props.moreInfo(beer)
    

    return (
        <View style={styles.containerParent} >

            <View>
                <Image style={styles.image} source={{ uri: props.beer.picture }}></Image>
            </View>

            <View style={styles.containerChildTwo}>

                <Text style={{ fontWeight: 'bold', color: '#194454', fontSize: 20 }}>
                    {props.beer.name}
                </Text>

                <Text style={styles.texteType}>
                    {props.beer.type}
                </Text>

                <Text style={styles.texte}>
                    {props.beer.alcool + '% Alc.'}
                </Text>

                <View style={styles.stars}>
                    {starByNote(() => {
                        let globalNote = 0;
                        props.beer.notes.forEach(e => globalNote += e.note)
                        globalNote = Math.floor(globalNote / props.beer.notes.length)

                        let stars = [];
                        for (let i = 0; i < 5; i++) {
                            globalNote > i ? stars.push(<Icon key={i} style={{ marginRight: 2 }} name="star" size={25} color="#F9D512" />)
                            : stars.push(<Icon key={i} style={{ marginRight: 2 }} name="star" size={25} color="#FDF0AA" />)
                        }
                        
                        return stars
                    })}
                </View>

            </View>

            <View style={styles.containerChildThree}>

                <View style={styles.backgroundIcone}>
                    <IconI onPress={() => moreInfoBeer(props.beer)} style={styles.iconeI} name="info" size={30} />
                </View>

                <IconM
                    onPress={() => manageWishlist()}
                    name="heart-plus"
                    size={35}
                    color={color}
                />


                <Text style={styles.note}>
                    {starByNote(() => {
                        let globalNote = 0;
                        props.beer.notes.forEach(e => globalNote += e.note);
                        globalNote = globalNote / props.beer.notes.length;
                        if (isNaN(globalNote)) return 0
                        else return globalNote.toFixed(1)
                    })}
                </Text>

            </View>

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
    backgroundIcone: {
        backgroundColor: "#F9D512",
        borderRadius: 50,
    },
    iconeI: {
        color: 'white',
        width: 30,
        textAlign: 'center',
    },
    note: {
        color: "#194454",
        fontSize: 25,
        fontWeight: 'bold',
    },
})