/**
 * Matthias
 * 20/12/2021
 * 
 */

// imports
import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Button, TouchableOpacity } from 'react-native'
import { Input, NativeBaseProvider } from "native-base"
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';

import * as Facebook from 'expo-facebook'; // google connection
import * as Google from 'expo-google-app-auth'; // facebook connection

import {IPADRESS, androidClientId, iosClientId} from '../HideData';


export default function Log({ navigation }) {

    const dispatch = useDispatch()
    const token = useSelector(store => store.token)

    // Force to render homepage when come back from login
    useFocusEffect(
        React.useCallback(() => {
            if(token !== '') navigation.navigate('StackNav', {screen: 'Homepage'})
            return () => {  }
        }, [token])
    )
    

    /*Log*/
    const [display, setDisplay] = useState('flex')
    const [displayTwo, setDisplayTwo] = useState('flex')
    const [google, setGoogle] = useState('Google')

    // toggle to show sign in or sign up
    const toogle = () => display === 'flex' ? setDisplay('none') : setDisplay('flex');

    const toogleTwo = () => displayTwo === 'flex' ? setDisplayTwo('none') : setDisplayTwo('flex'); 


    /*SignUp*/
    const [signUpPseudo, setSignUpPseudo] = useState('')
    const [signUpEmail, setSignUpEmail] = useState('')
    const [signUpPassword, setSignUpPassword] = useState('')

    const [errorSignup, setErrorSignup] = useState('')


    var handleSubmitSignup = async () => {

        if (signUpPseudo !== '' || signUpEmail !== '' || signUpPassword !== '') {
            const request = await fetch(`http://${IPADRESS}:3000/users/sign-up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `pseudo=${signUpPseudo}&email=${signUpEmail}&password=${signUpPassword}&avatar=default`
            })
            const result = await request.json()

            if (result.error === '') {
                AsyncStorage.setItem('userEmail', signUpEmail)
                AsyncStorage.setItem('userPassword', signUpPassword)
                dispatch({ type: 'addToken', token: result.token })
                navigation.navigate('Profile')
            } else if (result.error === 'Vous avez déjà un compte.') {
                setErrorSignin(result.error)
                setSignInEmail(signUpEmail)
                setSignUpEmail('')
                setSignUpPassword('')
                setSignUpPseudo('')
                toogleTwo()
            } else {
                setErrorSignup(result.error)
                setSignUpPseudo('')
            }

        } else setErrorSignup('Un des champs est manquant !')
    }

    


    /*Sign In*/
    const [signInEmail, setSignInEmail] = useState('')
    const [signInPassword, setSignInPassword] = useState('')

    const [errorSignin, setErrorSignin] = useState('')


    let handleSubmitSignin = async () => {

        if (signInEmail !== '' || signInPassword !== '') {
            const request = await fetch(`http://${IPADRESS}:3000/users/sign-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `email=${signInEmail}&password=${signInPassword}`
            })
            const result = await request.json()

            if (result.error === '') {
                // if no error, check if there's already in local storage
                AsyncStorage.getItem('userEmail', (err, data) => {
                    if (data !== signInEmail || data === null) {
                        AsyncStorage.setItem('userEmail', signInEmail)
                        AsyncStorage.setItem('userPassword', signInPassword)
                    }
                })
                dispatch({ type: 'addToken', token: result.token })
                dispatch({ type: 'updateWishlist', wishlist: result.wishlist })
                navigation.navigate('Profile')
            } else if (result.error === 'Mot de passe incorrect.') {
                setSignInPassword('')
                setErrorSignin(result.error)
            } else if (result.error === 'Pas de compte avec cette adresse.') {
                setErrorSignin('')
                setErrorSignup(result.error)
                setSignUpEmail(signInEmail)
                setSignInPassword('')
                setSignInEmail('')
                setSignUpPassword('')
                setSignUpPseudo('')
                toogleTwo()
            }
        } else setErrorSignin('Un des champs est manquant !')
    }


    /*Facebook sign in (not finished)*/
    const facebookLogin = async () => {
        await Facebook.initializeAsync({
            appId: '1005835353329669',
        });
        const { type, token, expirationDate, permissions, declinedPermissions } =
            await Facebook.logInWithReadPermissionsAsync({
                permissions: ['public_profile'],
            });
            if (type === 'success') {
                // Get the user's name using Facebook's Graph API
                let response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
                response = await response.json()
            }
    }


    // google sign in
    const googleSignIn = async () => {
        try {
            setGoogle('Connexion...')
            const res = await Google.logInAsync({
                androidClientId: `${androidClientId}.apps.googleusercontent.com`,
                iosClientId: `${iosClientId}.apps.googleusercontent.com`,
                scopes: ['profile', 'email'],
            });
            
            if (res.type === 'success') {
                const psw = generateP();

                // try to create a an account 
                const request = await fetch(`http://${IPADRESS}:3000/users/sign-up`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `pseudo=${res.user.givenName + Math.floor(Math.random()*999)}&email=${res.user.email}&password=${psw}&avatar=${res.user.photoUrl}`
                })
                const result = await request.json()

                // if account already exist make sign in
                if (result.error !== '') {
                    const request2 = await fetch(`http://${IPADRESS}:3000/users/sign-in`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `email=${res.user.email}&password=${result.password}`
                    })
                    const result2 = await request2.json()
                    if(result2.error === '') dispatch({ type: 'addToken', token: result2.token })
                }else dispatch({ type: 'addToken', token: result.token })

                AsyncStorage.setItem('userEmail', res.user.email)
                AsyncStorage.setItem('userPassword', result.password)
                navigation.navigate('Profile')
                setGoogle('Google')
            } else {
                console.log('not success')
                console.log(res)
                setGoogle('Google')
            }
        } catch (err) {
                setGoogle('Google')
                console.log(`error  ${err}`)
        }

    }



    return (
        <NativeBaseProvider style={{ flex: 1 }}>

            <View style={{ display: display, height: '100%', justifyContent: 'center', alignItems: 'center' }}>

                <View>
                    <Image source={require('../assets/logo_loc_ale_contour_bleufonce.png')} style={styles.logo} />
                </View>

                <View>

                    <TouchableOpacity onPress={() => toogle()} style={styles.email} >
                        <Text style={{ fontSize: 20, color: '#fff' }}>Adresse Mail</Text>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => googleSignIn()} style={styles.google} >
                        <Icon name="google" size={30} color="#fff" />
                        <Text style={{ fontSize: 20, color: '#fff', marginLeft: 38 }}>{google}</Text>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => facebookLogin()} style={styles.facebook} >
                        <Icon name="facebook" size={30} color="#fff" />
                        <Text style={{ fontSize: 20, color: '#fff', marginLeft: 38 }}>Facebook</Text>
                    </TouchableOpacity>

                </View>

            </View>


            {/* SIGN UP */}
            <View style={{ display: displayTwo, height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#194454' }}>

                <View>
                    <Image source={require('../assets/logo_loc_ale_contour_bleufonce.png')} style={styles.logo} />
                </View>

                <Text style={{ color: '#e63946' }}>{errorSignup}</Text>

                <View>

                    <View style={styles.backgroundColorInput}>
                        <Input style={styles.input} variant="underlined" onChangeText={(value) => setSignUpPseudo(value)} value={signUpPseudo} placeholder='Pseudo'></Input>
                        <Input style={styles.input} variant="underlined" onChangeText={(value) => setSignUpEmail(value)} value={signUpEmail} placeholder='Email'></Input>
                        <Input style={styles.input} variant="underlined" onChangeText={(value) => setSignUpPassword(value)} value={signUpPassword} secureTextEntry={true} placeholder='Mot de passe'></Input>
                    </View>

                    <View style={styles.button}>
                        <Button title="Valider" color="#194454" onPress={() => handleSubmitSignup()}></Button>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text onPress={() => toogleTwo()} style={styles.text}>Déjà un compte ?</Text>
                        <Text onPress={() => toogle()} style={styles.text}>Se connecter autrement.</Text>
                    </View>

                </View>

            </View>


            {/* SIGN IN */}
            <View style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#194454' }}>

                <View>
                    <Image source={require('../assets/logo_loc_ale_contour_bleufonce.png')} style={styles.logo} />
                </View>

                <Text style={{ color: '#e63946' }}>{errorSignin}</Text>

                <View style={styles.containerButton}>

                    <View>

                        <View style={styles.backgroundColorInput}>
                            <Input style={styles.input} variant="underlined" onChangeText={(value) => setSignInEmail(value)} value={signInEmail} placeholder='Email'></Input>
                            <Input style={styles.input} variant="underlined" onChangeText={(value) => setSignInPassword(value)} value={signInPassword} secureTextEntry={true} placeholder='Mot de passe'></Input>
                        </View>

                        <View style={styles.button}>
                            <Button title="Valider" color="#194454" onPress={() => handleSubmitSignin()}></Button>
                        </View>

                        <Text onPress={() => toogleTwo()} style={styles.text}>Pas encore de compte ?</Text>

                    </View>

                </View>

            </View>
        </NativeBaseProvider>
    )

}
/*Style Log*/
const styles = StyleSheet.create({
    logo: {
        width: 100,
        height: 100,
        marginBottom: 50,
    },
    backgroundTexte: {
        backgroundColor: '#194454',
        width: 250,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: 50,
    },
    backgroundTexteFB: {
        backgroundColor: '#3b5998',
        width: 250,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    backgroundTexteGL: {
        backgroundColor: '#db4A39',
        width: 250,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    email: {
        padding: 10,
        margin: 20,
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#194454',
    },
    /*Style SignUp*/
    backgroundColorInput: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: 300,
        marginBottom: 20,
    },
    input: {
        textAlign: 'center',
        width: 250,
        height: 50,
    },
    button: {
        borderWidth: 2,
        borderRadius: 15,
        borderColor: '#fff',
        padding: 10,
    },
    compte: {
        marginTop: 60,
    },
    /*Style SignIn*/
    containerButton: {
        width: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texteCompte: {
        color: 'white',
        fontSize: 15,
    },
    text: {
        color: 'lightblue',
        margin: 10,
    },
    google: {
        padding: 10,
        margin: 20,
        backgroundColor: '#4587F4',
        alignItems: 'center',
        borderRadius: 5,
        flexDirection: 'row',
    },
    facebook: {
        padding: 10,
        margin: 20,
        width: 210,
        alignItems: 'center',
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: '#3A579D',
    }

})

function generateP() {
    var pass = '';
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= 8; i++) {
        var char = Math.floor(Math.random()
            * str.length + 1);

        pass += str.charAt(char)
    }

    return pass;
}




