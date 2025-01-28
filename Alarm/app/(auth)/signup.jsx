import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUp() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = () => {
        console.log(name, email, password, confirmPassword);

        axios.put('https://6483-109-245-202-17.ngrok-free.app/signup', {name, email, password, confirmPassword})
        .then((res) => {
            if(res.status == 201){
            AsyncStorage.setItem('@user', JSON.stringify(res.data));
            console.log(res.data);
            router.push('Wake');
            }
        })
        .catch((err) => {
            console.log(err);   
        })}
    


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
                <Text className="text-4xl">😴</Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-gray-200">
              Create Account
            </Text>
            <Text className="text-gray-400 mt-2">
              Start your journey to better sleep
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-300 font-medium mb-2 ml-1">
                Name
              </Text>
              <TextInput
                className="bg-gray-800/80 p-4 rounded-xl text-gray-200"
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
                onChangeText={(text) => setName(text)}
              />
            </View>

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
                placeholder="Create a password"
                placeholderTextColor="#64748b"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
              />
            </View>

            <View>
              <Text className="text-gray-300 font-medium mb-2 ml-1">
                Confirm Password
              </Text>
              <TextInput
                className="bg-gray-800/80 p-4 rounded-xl text-gray-200"
                placeholder="Confirm your password"
                placeholderTextColor="#64748b"
                secureTextEntry
                onChangeText={(text) => setConfirmPassword(text)}
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            className="bg-sky-600 py-4 rounded-xl mt-8"
            onPress={handleSignUp}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Already have an account? </Text>
            <Link href="/signin" className="text-sky-400 font-medium">
              Sign In
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
