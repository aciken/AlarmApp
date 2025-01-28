import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [localAlarms, setLocalAlarms] = useState([]);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            console.log('Checking login status...');

            const storedUser = await AsyncStorage.getItem('@user');
            console.log('Stored user:', storedUser);
            if (storedUser) {
                console.log(`storedUser type: ${typeof storedUser}, value: ${storedUser}`)
                const parsedUser = JSON.parse(storedUser);
                setLocalAlarms(parsedUser.alarms || []);
                
                axios.post('https://6483-109-245-202-17.ngrok-free.app/getUser', { id: parsedUser._id })
                    .then(res => {
                        console.log('User data:', res.data);
                        if(res.data == 'User not found'){
                            AsyncStorage.clear();
                            setIsLogged(false);
                            setUser(null);
                        } else {
                            setUser(parsedUser);
                            setIsLogged(true);
                            router.push('/Wake');  
                        }
                    })
                    .catch(e => {
                        console.error('Error fetching user data:', e);
                    })
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            AsyncStorage.clear();
            setIsLogged(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateLocalAlarm = async (alarmId, updates) => {
        const updatedAlarms = user.alarms.map(alarm => 
            alarm._id === alarmId ? { ...alarm, ...updates } : alarm
        );
        
        // Update both local alarms and user data
        const updatedUser = { ...user, alarms: updatedAlarms };
        setUser(updatedUser);
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
    };

    const updateUser = async (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
    };

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                user,
                setUser, 
                isLoading,
                setIsLoading,
                updateLocalAlarm,
                updateUser
            }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default GlobalProvider;




