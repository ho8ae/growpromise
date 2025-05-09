import React, { useCallback, memo } from 'react';
import { FlatList, ListRenderItem, ActivityIndicator, Text, View, StyleSheet } from 'react-native';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyText?: string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

function OptimizedListComponent<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  error = null,
  onRetry,
  emptyText = '데이터가 없습니다.',
  onEndReached,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  ListFooterComponent,
}: OptimizedListProps<T>) {
  // 메모이제이션된 빈 리스트 표시
  const EmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.emptyText}>데이터를 불러오는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry && (
            <Text style={styles.retryText} onPress={onRetry}>
              다시 시도
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }, [isLoading, error, emptyText, onRetry]);

  // 메모이제이션된 Footer
  const FooterComponent = useCallback(() => {
    if (isLoading && data.length > 0) {
      return <ActivityIndicator size="small" color="#10b981" style={styles.footer} />;
    }

    return ListFooterComponent ? (
      typeof ListFooterComponent === 'function' ? (
        <ListFooterComponent />
      ) : (
        ListFooterComponent
      )
    ) : null;
  }, [isLoading, data.length, ListFooterComponent]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={EmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={FooterComponent}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21}
      contentContainerStyle={data.length === 0 ? styles.fullHeight : undefined}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 10,
  },
  footer: {
    paddingVertical: 20,
  },
  fullHeight: {
    flexGrow: 1,
  },
});

// 최적화를 위한 메모이제이션
export const OptimizedList = memo(OptimizedListComponent) as typeof OptimizedListComponent;