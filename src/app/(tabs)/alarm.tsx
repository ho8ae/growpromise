// src/app/(tabs)/alarm.tsx
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SafeStatusBar from '@/src/components/common/SafeStatusBar';
import api from '../../api';
import { Notification, NotificationType } from '../../api/modules/notification';
import Colors from '../../constants/Colors';
import { useNotifications } from '../../hooks/useNotifications';
import { useAlarmAutoRead } from '../../hooks/useAlarmAutoRead';
import { useAuthStore } from '../../stores/authStore';
import { notificationUtils } from '../../utils/notificationUtils';

export default function AlarmScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();
  const { updateUnreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  // 알림 목록 조회
  const {
    data: notificationsData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      return await api.notification.getNotifications(
        undefined,
        ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
      );
    },
    enabled: isAuthenticated,
  });

  // 화면 진입 시 자동 읽음 처리
  useAlarmAutoRead();

  // 데이터 업데이트 처리
  useEffect(() => {
    if (notificationsData) {
      if (page === 0) {
        setAllNotifications(notificationsData.notifications);
      } else {
        setAllNotifications(prev => [...prev, ...notificationsData.notifications]);
      }
      setHasMore(notificationsData.notifications.length === ITEMS_PER_PAGE);
    }
  }, [notificationsData, page]);

  // 새로고침 처리
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      setPage(0);
      await refetch();
      await updateUnreadCount();
    } catch (error) {
      console.error('알림 새로고침 오류:', error);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [isAuthenticated, refetch, updateUnreadCount]);

  // 더 많은 알림 로드
  const loadMoreNotifications = useCallback(async () => {
    if (loadingMore || !hasMore || !isAuthenticated) return;

    setLoadingMore(true);
    try {
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('추가 알림 로드 오류:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, isAuthenticated]);

  // 개별 알림 읽음 처리
  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await api.notification.updateNotificationReadStatus(notification.id, true);
      
      // 로컬 상태 업데이트
      setAllNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      
      await updateUnreadCount();
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
    }
  };

  // 알림 아이템 렌더링
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.isRead;

    return (
      <Pressable
        className={`mx-4 mb-3 p-4 rounded-xl border ${
          isUnread
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-100'
        }`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          markAsRead(item);
        }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-start">
          {/* 알림 아이콘 */}
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              isUnread ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Text className="text-lg">
              {notificationUtils.getNotificationIcon(item.notificationType)}
            </Text>
          </View>

          {/* 알림 내용 */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className={`text-base font-semibold ${
                  isUnread ? 'text-gray-900' : 'text-gray-600'
                }`}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {isUnread && (
                <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
              )}
            </View>

            <Text
              className={`text-sm mb-2 ${
                isUnread ? 'text-gray-700' : 'text-gray-500'
              }`}
              numberOfLines={3}
            >
              {item.content}
            </Text>

            <Text className="text-xs text-gray-400">
              {notificationUtils.getRelativeTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // 비어있는 상태 렌더링
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-4">
      <View className="items-center">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="notifications-outline" size={40} color="#9CA3AF" />
        </View>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          알림이 없습니다
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          새로운 알림이 있으면 여기에 표시됩니다
        </Text>
      </View>
    </View>
  );

  // 로딩 푸터 렌더링
  const renderLoadingFooter = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={Colors.light.primary} />
        <Text className="text-sm text-gray-500 mt-2">더 많은 알림 불러오는 중...</Text>
      </View>
    );
  };

  // 비인증 상태
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white">
        <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
        <View
          className="flex-1 items-center justify-center px-4"
          style={{ paddingTop: insets.top }}
        >
          <View className="items-center">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-gray-700 mb-2">
              로그인이 필요합니다
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              알림을 확인하려면 로그인해주세요
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
      
      {/* 헤더 */}
      <View
        className="bg-white px-4 py-3 border-b border-gray-100"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">알림</Text>
          
          {/* 읽지 않은 알림 수 표시 */}
          {notificationsData && notificationsData.unreadCount > 0 && (
            <View className="bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                {notificationUtils.formatBadgeCount(notificationsData.unreadCount)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 알림 목록 */}
      {isLoading && page === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text className="text-sm text-gray-500 mt-2">알림을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="items-center">
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text className="text-lg font-semibold text-gray-700 mb-2 mt-2">
              오류가 발생했습니다
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              알림을 불러오는 중 문제가 발생했습니다
            </Text>
            <Pressable
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={onRefresh}
            >
              <Text className="text-white font-semibold">다시 시도</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={allNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderLoadingFooter}
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 100,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}