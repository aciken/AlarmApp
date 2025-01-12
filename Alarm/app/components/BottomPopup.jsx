import React, { useState, useRef, useEffect } from 'react';
import { View, Modal, Animated, TouchableWithoutFeedback, StyleSheet, PanResponder, Dimensions } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 150; // Pixels to drag before dismissing

const BottomPopup = ({ visible, onClose, children, height }) => {
    const [showModal, setShowModal] = useState(visible);
    const slideAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
    useEffect(() => {
      toggleModal();
    }, [visible]);
  
    const toggleModal = () => {
      if (visible) {
        setShowModal(true);
        Animated.spring(slideAnimation, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnimation, {
          toValue: SCREEN_HEIGHT,
          duration: 125,
          useNativeDriver: true,
        }).start(() => {
          setShowModal(false);
        });
      }
    };
  
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            slideAnimation.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > DISMISS_THRESHOLD) {
            onClose();
          } else {
            Animated.spring(slideAnimation, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;
  
    const slideInStyle = {
      transform: [{ translateY: slideAnimation }],
    };
  
    return (
      <Modal transparent visible={showModal} animationType="fade">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.modalContent(height), slideInStyle]}
            >
              <View style={styles.dragIndicatorContainer}>
                <View style={styles.dragIndicator} />
              </View>
              <View style={styles.childrenContainer}>
                {children}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
  
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContent: (height) => ({
      backgroundColor: '#f0f9ff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      minHeight: SCREEN_HEIGHT * height,
      maxHeight: SCREEN_HEIGHT * height,
    }),
    dragIndicatorContainer: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 10,
    },
    dragIndicator: {
      width: 40,
      height: 5,
      backgroundColor: '#94a3b8',
      borderRadius: 3,
    },
    childrenContainer: {
      flex: 1,
      padding: 10,
    },
  });
  
  export default BottomPopup;