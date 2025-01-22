import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, Animated, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomPopup = ({ visible, onClose, height = 0.5, children }) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        mass: 0.8,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const handleClose = () => {
    animateOut();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        // Only respond to touches in the handle area
        return gestureState.y0 < 50;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && gestureState.y0 < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          backdropOpacity.setValue(1 - (gestureState.dy / (SCREEN_HEIGHT * 0.25)));
        } 
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          animateIn();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible]);

  if (!visible && !modalVisible) return null;

  return (
    <Modal
      transparent
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={{ 
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          opacity: backdropOpacity,
        }}
        pointerEvents="auto"
      >
        <TouchableOpacity 
          style={{ flex: 1 }}
          onPress={handleClose}
          activeOpacity={1}
        />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            height: `${height * 100}%`,
            backgroundColor: '#1e293b',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderColor: '#334155',
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
          }}
        >
          {/* Drag Handle */}
          <View 
            {...panResponder.panHandlers}
            className="w-full items-center pt-2 pb-4"
          >
            <View className="w-12 h-1.5 bg-gray-700 rounded-full" />
          </View>

          {/* Content */}
          <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default BottomPopup;