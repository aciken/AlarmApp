import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this component at the top of the file, before the AddFriends component
const RequestItem = ({ request, onAccept, onDecline, isPending = false }) => {
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    axios.post('https://6eea-109-245-206-230.ngrok-free.app/getUser', {
      id: request
    }).then((res) => {
      setRequestData(res.data);
    });
  }, [request]);

  if (!requestData) {
    return (
      <View className="bg-gray-900/50 rounded-xl p-4 mb-3 border border-gray-800/50">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-gray-800/50 animate-pulse" />
          <View className="ml-3 flex-1">
            <View className="w-24 h-4 bg-gray-800/50 rounded animate-pulse" />
            <View className="w-16 h-3 bg-gray-800/50 rounded mt-2 animate-pulse" />
          </View>
        </View>
      </View>
    );
  }

  const level = Math.floor(requestData.xp / 100) + 1;
  const progress = (requestData.xp % 100);

  return (
    <View className="bg-gray-900/50 rounded-xl p-4 mb-3 border border-gray-800/50">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="relative">
            {requestData.avatar ? (
              <Image
                source={{ uri: requestData.avatar }}
                className="w-12 h-12 rounded-full bg-gray-800"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center">
                <Text className="text-gray-400 text-lg font-medium">
                  {requestData.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
              <View className="bg-gray-800 rounded-full px-1.5">
                <Text className="text-gray-400 text-xs font-medium">{level}</Text>
              </View>
            </View>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white font-medium text-base">{requestData.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-1 h-1 bg-gray-800 rounded-full mr-3">
                <View 
                  className="h-1 bg-sky-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-gray-400 text-xs">
                {requestData.xp % 100} / 100 XP
              </Text>
            </View>
          </View>
        </View>
        {isPending ? (
          <View className="bg-gray-800 px-4 py-1.5 rounded-full ml-3">
            <Text className="text-gray-400 font-medium text-sm">Pending</Text>
          </View>
        ) : (
          <View className="flex-row ml-3">
            <TouchableOpacity 
              className="bg-sky-500 px-4 py-1.5 rounded-full mr-2" 
              onPress={() => onAccept(requestData._id)}
            >
              <Text className="text-white font-medium text-sm">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-gray-800 px-4 py-1.5 rounded-full" 
              onPress={() => onDecline(requestData._id)}
            >
              <Text className="text-gray-400 font-medium text-sm">Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default function AddFriends() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user,setUser } = useGlobalContext();

  const pendingRequests = [
    {
      name: 'John D.',
      level: 15,
      avatar: 'https://i.pravatar.cc/100?img=52'
    },
    {
      name: 'Alice K.',
      level: 8,
      avatar: 'https://i.pravatar.cc/100?img=44'
    }
  ];

  const suggestedFriends = [
    {
      name: 'David L.',
      level: 19,
      avatar: 'https://i.pravatar.cc/100?img=53',
      mutualFriends: 3
    },
    {
      name: 'Sophie R.',
      level: 12,
      avatar: 'https://i.pravatar.cc/100?img=41',
      mutualFriends: 2
    }
  ];

  const [searchResult, setSearchResult] = useState(null);


  useEffect(() => {
    const handleSocialCheck = async () => {
      if (searchQuery.length === 8) {
        axios.post('https://6eea-109-245-206-230.ngrok-free.app/socialCheck', {
          socialId: searchQuery,
          userId: user._id
        }).then((res) => {
          if (res.data.error) {
            setSearchResult(null);
            return;
          }

          // Check if it's the user themselves
          if (res.data._id === user._id) {
            setSearchResult({ ...res.data, status: 'self' });
            return;
          }

          // Check if they're already friends
          const isFriend = user.friends.list.some(friend => friend === res.data._id);
          if (isFriend) {
            console.log('isFriend');
            setSearchResult({ ...res.data, status: 'friend' });
            return;
          }

          // Check if there's a pending request
          const isPending = user.friends.pending.some(friend => friend === res.data._id);
          if (isPending) {
            console.log('isPending');
            setSearchResult({ ...res.data, status: 'pending' });
            return;
          }

          // Check if there's an incoming request
          const isRequested = user.friends.requests.some(friend => friend === res.data._id);
          if (isRequested) {
            console.log('isRequested');
            setSearchResult({ ...res.data, status: 'requested' });
            return;
          }

          // If none of the above, they can be added
          console.log('none');
          setSearchResult({ ...res.data, status: 'none' });
        }).catch((err) => {
          setSearchResult(null);
        });
      } else {
        setSearchResult(null);
      }
    };

    handleSocialCheck();
  }, [searchQuery]);


  const handleAddFriend = async (userId) => {
    setSearchResult(null);
    setSearchQuery('');
    axios.put('https://6eea-109-245-206-230.ngrok-free.app/addFriend', {
      userId: user._id,
      friendId: userId
    }).then((res) => {
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
    });
  }

  const handleAcceptRequest = async (userId) => {
    console.log(userId);
    axios.put('https://6eea-109-245-206-230.ngrok-free.app/acceptRequest', {
      userId: user._id,
      friendId: userId
    }).then((res) => {
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
    }).catch((err) => {
      console.log(err);
    });
  }

  const handleDeclineRequest = async (userId) => {
    axios.put('https://6eea-109-245-206-230.ngrok-free.app/declineRequest', {
      userId: user._id,
      friendId: userId
    }).then((res) => {
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
    }).catch((err) => {
      console.log(err);
    });
  }


  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-2 pb-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-400">↓</Text>
          </TouchableOpacity>
          <Text className="text-lg font-medium text-white ml-2">Add Friends</Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Search Bar */}
          <View className="bg-gray-800/50 rounded-xl p-3 mb-6 border border-gray-700/50">
            <TextInput
              placeholder="Search by username or ID"
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-white text-base"
            />
          </View>

          {/* Search Result Card */}
          {searchResult && (
            <View className="mb-6">
              <Text className="text-sky-400 text-sm font-medium mb-3">
                SEARCH RESULT
              </Text>
              <View className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {searchResult.avatar ? (
                      <Image
                        source={{ uri: searchResult.avatar }}
                        className="w-10 h-10 rounded-full bg-gray-800"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center">
                        <Text className="text-gray-400 text-lg">
                          {searchResult.name?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-medium">
                        {searchResult.name || 'Unknown User'}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        Level {Math.floor(searchResult.xp / 100) + 1}
                      </Text>
                    </View>
                  </View>
                  {searchResult.status === 'self' ? (
                    <View className="bg-gray-800/50 px-4 py-1.5 rounded-full">
                      <Text className="text-gray-400 font-medium">You</Text>
                    </View>
                  ) : searchResult.status === 'friend' ? (
                    <View className="bg-gray-800/50 px-4 py-1.5 rounded-full">
                      <Text className="text-gray-400 font-medium">Friend</Text>
                    </View>
                  ) : searchResult.status === 'pending' ? (
                    <View className="bg-gray-800/50 px-4 py-1.5 rounded-full">
                      <Text className="text-gray-400 font-medium">Pending</Text>
                    </View>
                  ) : searchResult.status === 'requested' ? (
                    <View className="bg-gray-800/50 px-4 py-1.5 rounded-full">
                      <Text className="text-gray-400 font-medium">Requested</Text>
                    </View>
                  ) : searchResult.status === 'none' ? (
                    <TouchableOpacity 
                      className="bg-sky-500 px-4 py-1.5 rounded-full"
                      onPress={() => handleAddFriend(searchResult._id)}
                    >
                      <Text className="text-white font-medium">Add</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* Friend Requests */}
          {user.friends?.requests?.length > 0 ? (
            <View className="mb-6">
              <Text className="text-sky-400 text-sm font-medium mb-3">
                PENDING REQUESTS
              </Text>
              {user.friends?.requests?.map((request, index) => (
                <RequestItem 
                  key={index}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))}
            </View>
          ) : user.friends?.pending?.length > 0 ? (
            <View>
              <Text className="text-sky-400 text-sm font-medium mb-3">
                SENT REQUESTS
              </Text>
              {user.friends?.pending?.map((request, index) => (
                <RequestItem 
                  key={index}
                  request={request}
                  isPending={true}
                />
              ))}
            </View>
          ) : (
            <View className="items-center py-8 bg-gray-900/30 rounded-2xl border border-gray-800/30">
              <Text className="text-gray-400 text-lg mb-2">Connect with Friends</Text>
              <Text className="text-gray-500 text-sm text-center px-4">Share your Social ID with friends to start connecting and comparing sleep stats!</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 