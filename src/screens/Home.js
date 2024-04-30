import { StyleSheet, Image, Linking, ActivityIndicator, Text, TouchableOpacity, Dimensions, View, PermissionsAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import Entypo from 'react-native-vector-icons/Entypo'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
const { width, height } = Dimensions.get('window')


const Home = () => {

    const [data, setData] = useState()
    const [isLoading, setIsLoading] = useState(false);
    const [textResult, setTextResult] = useState('See result here')
    const [url, setUrl] = useState('https://i.pinimg.com/originals/68/54/1d/68541d965a060d7a6c2e8957f999cc17.jpg');

    function openGallery() {
        let options = {
            mediaType: 'photo',
            type: 'library',
            includeBase64: true,
        }
        launchImageLibrary(options, respone => {
            if (respone.didCancel) {
                console.log('User cancelled image picker')
            }
            else if (respone.errorCode) {
                console.log(respone.errorCode)
            }
            else {
                setData(respone.assets[0])
                setUrl(respone.assets[0].uri)
            }
        })
    }

    async function openGG() {
        Linking.openURL('https://google.com')
    }
    async function openCamera() {
        let options = {
            mediaType: 'photo',
            saveToPhotos: true
        }
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await launchCamera(options)
            setData(result.assets[0])
            setUrl(result.assets[0].uri)
        }
        else {
            console.log(granted)
        }

    }


    async function sendToServer() {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('image', {
            uri: data.uri,
            type: data.type,
            name: data.fileName
        })
        try {
            console.log(formData._parts)
            let res = await fetch(
                'http://192.168.1.5:5000/classify',
                {
                    method: 'post',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setIsLoading(false)
            let responseJson = await res.json();
            setTextResult(`Your image is a/an ${responseJson.class}`)
        } catch (error) {
            setIsLoading(false)
            console.error('Error during fetch:', error);
        }
    }

    async function getMethod() {
        try {
            let res = await axios.get('http://192.168.1.5:5000/check_connection');
            setTextResult(res.data.message);
        } catch (error) {
            console.error('Error during Axios request:', JSON.stringify(error));
            setTextResult('Error occurred during the request. Please check your network connection and try again.');
        }
    }

return (
    <View style={styles.container}>
        <Image
            style={styles.img}
            source={{ uri: url }} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
                onPress={() => { openGallery() }}
                style={styles.btn}>
                <Text style={styles.text}>Open Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => { openCamera() }}
                style={styles.btn}>
                <Text style={styles.text}>Open camera</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity
            onPress={() => {
                if (data) getMethod()
                else Alert.alert('Please choose an image to send')
            }}
            style={[styles.btn, { backgroundColor: '#a000c8' }]}>
            <Text style={[styles.text,]}>Send to server</Text>
        </TouchableOpacity>

        <Entypo name="arrow-down" size={25} color={'white'} />
        {
            isLoading ?
                <ActivityIndicator size={40} />
                :
                <Text style={[styles.result,]}>
                    {textResult}
                </Text>
        }
    </View>
)
    }

export default Home

const styles = StyleSheet.create({
    result: {
        color: '#213571', textAlign: 'center', backgroundColor: 'white',
        fontFamily: "Poppins-Black", fontSize: 20,
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30
    },
    text: {
        color: 'white', textAlign: 'center',
        fontFamily: "Poppins-Bold", fontSize: 16
    },
    btn: {
        height: 50, width: width * .4, justifyContent: 'center',
        alignItems: 'center', borderRadius: 30, elevation: 4, backgroundColor: '#213571'
    },
    img: {
        height: width,
        width: width - 20,
        borderRadius: 80,
        resizeMode: 'contain',
    },
    container: {
        flex: 1, gap: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFD700'
    }
})