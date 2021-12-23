/**
 * Matthias
 * 20/12/2021
 * 
 */

// imports
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Button, Modal, FormControl, Input, Center, NativeBaseProvider, Avatar, useToast } from "native-base"

import MapView, { Marker } from 'react-native-maps';

import Icon from 'react-native-vector-icons/FontAwesome';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';

import {IPADRESS} from '../HideData'


export default function BeerInfo({ navigation }) {

    const dispatch = useDispatch()

    const beerInfo = useSelector(store => store.beerInfo)
    const wishlist = useSelector(store => store.wishlist)
    const token = useSelector(store => store.token)
    const currentPosition = useSelector(store => store.location)

    const [sellers, setSellers] = useState([]);
    const [region, setRegion] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [like, setLike] = useState(false);
    const [imageKey, setimageKey] = useState(1);

    const toast = useToast()


    useEffect(() => {

        // get all the sellers from DB for the beer choose
        const getSellers = async () => {
            const request = await fetch(`http://${IPADRESS}:3000/get-sellers/${JSON.stringify(currentPosition)}/${beerInfo._id}`)
            const result = await request.json()
            setSellers(result.sellers)
        }
        getSellers();

        wishlist.forEach(e => { if (e._id === beerInfo._id) setLike(true) });

        setimageKey(prev => prev + 1); // change the key of the image so it re-render as well

    }, [beerInfo])


    // --- global note --- //
    let stars = [];
    let globalNote = 0;

    beerInfo.notes.forEach(el => globalNote += el.note); // set the sum of the notes 
    globalNote = Math.floor(globalNote / beerInfo.notes.length); // make the average

    // make 5 stars depending the color
    for (let i = 0; i < 5; i++)
        globalNote > i ? stars.push(<Icon key={i} style={styles.star} name="star" size={30} color="#F9D512" />)
            : stars.push(<Icon key={i} style={styles.star} name="star" size={30} color="#FDF0AA" />)



    // --- markers sellers --- //
    let markers = [];

    if (sellers.length !== 0) { // make condition to avoid errors

        // create marker for every seller
        sellers.forEach((el, i) => markers.push(
            <Marker
                key={i}
                coordinate={{ latitude: el.latitude, longitude: el.longitude }}
                title={el.name}
                description={el.type === 'brewery' ? 'Brasserie' : el.type === 'shop' ? 'Magasin' : 'Bar/Restaurant'}
            >
                <Icon5 style={styles.star} name="map-marker-alt" size={30} color="#194454" />
            </Marker>
        ))
    }

    // get date 
    let date = new Date()
    let today = date.getDay();

    // function that return a function to make for loop in jsx
    const starByNote = s => s()


    //format date
    let dateFormat = el => {
        let date = new Date(el);
        return date.toLocaleDateString('fr-FR');
    }

    // create every note with the comment and the owner of the note
    let BeerNotes = [];

    if (beerInfo.notes.length === 0)
        BeerNotes.push(
            <View style={{ borderTopWidth: 1, padding: 20 }}>
                <Text style={{ width: '80%', color: "lightgrey", fontSize: 18 }}>Cette bière n'a pas encore de note, ajoute en une !</Text>
            </View>
        )

    else BeerNotes = beerInfo.notes.map((el, i) => (
        <View key={i} style={styles.card}>
            <View style={styles.starContainer}>
                {starByNote(() => {
                    let stars = [];

                    for (let i = 0; i < 5; i++)
                        el.note > i ? stars.push(<Icon style={styles.star} name="star" size={27} color="#F9D512" />)
                        : stars.push(<Icon style={styles.star} name="star" size={27} color="#FDF0AA" />)

                    return stars
                })}
            </View>
            <View>
                <View style={styles.cardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ margin: 10, backgroundColor: 'grey', width: 30, height: 30, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar
                                size="sm"
                                source={el.owner.avatar !== 'default' ? { uri: el.owner.avatar } : require('../assets/logo_matth_transparent.png')}
                                key={imageKey}
                            />
                        </View>
                        <Text style={{ width: 100, color: '#194454' }}>{el.owner.pseudo}</Text>
                    </View>
                    <Text style={{ color: '#194454', fontSize: 11, position: 'absolute', left: 120 }}>{dateFormat(el.date)}</Text>
                </View>
                <Text style={{ width: 180, color: '#194454', fontWeight: 'bold', textAlign: 'center' }}>{el.comment}</Text>
            </View>
        </View>
    ))

    // create the stars for adding a note 
    const modalStars = [];

    for (let i = 0; i < 5; i++) 
        myRating > i ? modalStars.push(<Icon onPress={() => setMyRating(i + 1)} style={styles.star} name="star" size={35} color="#F9D512" />)
        : modalStars.push(<Icon onPress={() => setMyRating(i + 1)} style={styles.star} name="star" size={35} color="#FDF0AA" />)
    

    // if you arrive on BeerInfo.js from the search and try to go back, redux don't have the infos for BeerList.js yet
    const goBack = async () => {
        const request = await fetch(`http://${IPADRESS}:3000/get-brewery-from-beer/${beerInfo._id}`)
        const result = await request.json()
        dispatch({ type: 'selectedBrewerie', brewery: result })
        navigation.navigate('BeerList')
    }


    // to create a new note
    const addNote = async () => {

        // make sure the user is connected
        if (token !== '') {
            const request = await fetch(`http://${IPADRESS}:3000/users/add-note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `comment=${myComment}&note=${myRating}&token=${token}&beerId=${beerInfo._id}`
            })
            const result = await request.json()

            dispatch({ type: 'addBeerNote', note: result.saveNote })
            dispatch({ type: 'addUserNote', userNote: result.saveNote, beer: result.beer })

        } else navigation.navigate('StackNav', { screen: 'Log' })
    }


    // when you click an a heart
    const addToWishlist = async (beer, isInWishlist) => {
        
        // make sure the user is connected
        if (token !== '') {
            if (!isInWishlist) {
                toast.show({
                    title: "Bière ajoutée dans les favorites !",
                    status: "success",
                    placement: 'top',
                })
                dispatch({ type: 'addToWishList', beer: beer })
                setLike(true);
            } else {
                toast.show({
                    title: "Bière retirée des favorites !",
                    status: "danger",
                    placement: 'top',
                })
                dispatch({ type: 'removeFromWishlist', beer: beer })
                setLike(false);
            }
            await fetch(`http://${IPADRESS}:3000/users/add-To-Wishlist/${beer._id}/${token}`)
        } else navigation.navigate('StackNav', { screen: 'Log' })
    }


    return (
        <NativeBaseProvider>
            <View style={styles.container} >
                {/* top bar */}
                <View style={styles.topBar} >
                    <Icon onPress={() => goBack()} style={styles.icon} name="chevron-left" size={30} color="#fff" />
                    <Text style={styles.text}>{beerInfo.name}</Text>
                </View>

                <ScrollView nestedScrollEnabled={true} >
                    
                    {/* main infos */}
                    <View style={styles.infos}>
                        <View style={{ position: 'relative' }}>
                            <Image style={styles.image} source={{ uri: beerInfo.picture, }} />
                            {!like ? <IconM onPress={() => addToWishlist(beerInfo, like)} style={styles.heart} name="heart-plus" size={30} color="#F9D512" />
                                : <IconM onPress={() => addToWishlist(beerInfo, like)} style={styles.heart} name="heart-plus" size={30} color="#A15640" />
                            }

                        </View>
                        <View>
                            <View style={styles.badge}>
                                <Image style={styles.iconInfo} source={require('../assets/beer.png')} />
                                <Text style={styles.badgebackground}>{beerInfo.type}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Image style={styles.iconInfo} source={require('../assets/pas-dalcool.png')} />
                                <Text style={styles.badgebackground}>{beerInfo.alcool + "% Alc."}</Text>
                            </View>
                            <Text style={styles.slogan}>{beerInfo.slogan}</Text>
                            <View style={{ alignItems: 'center', marginTop: 30 }}>
                                <Text style={styles.avis}>L'avis des buveurs</Text>
                                <View style={styles.starContainer}>
                                    {stars}
                                    <Text>({beerInfo.notes.length})</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#194454', margin: 10 }}>Où puis-je la trouver ?</Text>

                    {/* map with sellers */}
                    <MapView
                        provider={MapView.PROVIDER_GOOGLE}
                        style={{ width: '100%', height: 200 }}
                        region={{
                            latitude: currentPosition.latitude,
                            longitude: currentPosition.longitude,
                            latitudeDelta: 0.04,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {markers}
                        <MapView.Marker coordinate={currentPosition} >
                            <View style={styles.localisation} />
                        </MapView.Marker>
                    </MapView>

                    {/* sellers list */}
                    <ScrollView nestedScrollEnabled={true} style={{ backgroundColor: '#194454', width: '100%', maxHeight: 220, padding: 10 }}>
                        {sellers.map((el, i) => (
                            <View key={i} style={styles.sellerCard} >
                                <Icon5 style={styles.star} name="map-marker-alt" size={30} color="#F9D512" />
                                <Text onPress={() => setRegion({ latitude: el.latitude, longitude: el.longitude })} style={{ fontSize: 20, color: '#194454', paddingRight: 7 }}>{el.name}</Text>
                                <Text style={{ color: 'lightgrey', width: '36%' }}>{el.hours[today].openings}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* section note */}
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#194454', margin: 10 }}>Les derniers avis</Text>

                    <View style={styles.notes}>
                        <Text onPress={() => setShowModal(true)} style={styles.addnote}><Icon name="plus" size={30} color="lightgrey" />   Laisser mon avis ...</Text>

                        {BeerNotes}

                    </View>

                </ScrollView>

                {/* modal when add note */}
                <Center flex={1}>
                    <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton />
                            <Modal.Header>Ajoute ton avis !</Modal.Header>
                            <Modal.Body>
                                <View style={{ flexDirection: 'row' }}>
                                    {modalStars}
                                </View>
                                <FormControl>
                                    <FormControl.Label>Comment l'as tu trouvée ?</FormControl.Label>
                                    <Input onChangeText={(v) => setMyComment(v)} />
                                </FormControl>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button.Group space={2}>
                                    <Button
                                        style={styles.button}
                                        onPress={() => {
                                            addNote();
                                            setShowModal(false)
                                        }}
                                    >
                                        <Icon5 name="check" size={30} color="#F9D512" />
                                    </Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                </Center>

            </View >
        </NativeBaseProvider>
    )
}

// styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    infos: {
        width: '100%',
        height: 380,
        flexDirection: 'row',
        padding: 10,
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
    image: {
        width: 130,
        height: 350,
    },
    heart: {
        position: 'absolute',
        right: 0,
    },
    iconInfo: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
    badge: {
        flexDirection: 'row',
        padding: 15,
        paddingBottom: 0,
    },
    badgebackground: {
        backgroundColor: '#194454',
        borderRadius: 50,
        color: "#F9D512",
        padding: 5,
        fontWeight: 'bold',
        fontSize: 16,
    },
    slogan: {
        fontSize: 20,
        width: 200,
        textAlign: 'center',
        marginTop: 20,
        color: '#194454',
    },
    avis: {
        borderBottomWidth: 2,
        borderBottomColor: '#194454',
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
    },
    localisation: {
        height: 25,
        width: 25,
        backgroundColor: '#737CD3',
        borderRadius: 50,
        borderStyle: 'solid',
        borderColor: '#FFFFFF',
        borderWidth: 4
    },
    star: {
        marginRight: 5,
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    notes: {
        width: '100%',
        borderWidth: 1,
        borderColor: "#194454",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    addnote: {
        color: 'lightgrey',
        fontSize: 22,
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#194454',
    },
    card: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: '#194454',
        padding: 5,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        maxWidth: '50%'
    },
    button: {
        backgroundColor: '#194454',
        marginRight: 100
    }
})