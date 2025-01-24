import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function SignIn() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = () => {
        if(email === '' || password === ''){
            alert('Please enter your email and password');
        } else {
        axios.put('https://f0c4-109-245-202-17.ngrok-free.app/signin', {email, password})
        .then((res) => {
            console.log(res.status);
            if(res.status == 200){
                console.log('yes');
                AsyncStorage.setItem('@user', JSON.stringify(res.data));
                router.push('Wake');
            } else {
                alert('Invalid email or password');
            }

        })
        .catch((err) => {
            alert('Invalid email or password');
        })
    }
}


  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-2 mb-8 w-8 h-8 items-center justify-center"
          >
            <Text className="text-2xl text-gray-400">←</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-12">
            <View className="bg-gray-800/50 rounded-full p-1 mb-4">
              <View className="bg-gray-800 rounded-full p-4">
                <Text className="text-4xl">⏰</Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-gray-200">
              Welcome Back
            </Text>
            <Text className="text-gray-400 mt-2">
              Sign in to continue tracking your sleep
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-300 font-medium mb-2 ml-1">
                Email
              </Text>
              <TextInput
                className="bg-gray-800/80 p-4 rounded-xl text-gray-200"
                placeholder="Enter your email"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
              />
            </View>

            <View>
              <Text className="text-gray-300 font-medium mb-2 ml-1">
                Password
              </Text>
              <TextInput
                className="bg-gray-800/80 p-4 rounded-xl text-gray-200"
                placeholder="Enter your password"
                placeholderTextColor="#64748b"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
              />
            </View>

            <TouchableOpacity>
              <Text className="text-sky-400 font-medium text-right">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity 
            className="bg-sky-600 py-4 rounded-xl mt-8"
            onPress={handleSignIn}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Don't have an account? </Text>
            <Link href="/signup" className="text-sky-400 font-medium">
              Sign Up
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
