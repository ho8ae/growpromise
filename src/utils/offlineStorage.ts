import AsyncStorage from '@react-native-async-storage/async-storage';

// 오프라인 액션 타입
type OfflineAction = 'verify_promise' | 'update_profile' | 'mark_notification_read';

// 오프라인 큐 아이템 타입
interface QueueItem {
  id: string;
  action: OfflineAction;
  payload: any;
  timestamp: number;
}

/**
 * 오프라인 상태에서 데이터를 저장하고 관리하는 유틸리티 클래스
 */
export class OfflineStorage {
  private static QUEUE_KEY = 'offline_queue';
  private static DATA_PREFIX = 'offline_data_';

  /**
   * 데이터를 로컬 저장소에 저장
   * @param key 저장 키
   * @param data 저장할 데이터
   */
  static async saveData<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(`${this.DATA_PREFIX}${key}`, jsonValue);
    } catch (error) {
      console.error('오프라인 데이터 저장 오류:', error);
    }
  }

  /**
   * 로컬 저장소에서 데이터 가져오기
   * @param key 가져올 데이터의 키
   * @returns 저장된 데이터 또는 null
   */
  static async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(`${this.DATA_PREFIX}${key}`);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('오프라인 데이터 로드 오류:', error);
      return null;
    }
  }

  /**
   * 오프라인 작업을 큐에 추가
   * @param action 액션 타입
   * @param payload 액션 데이터
   */
  static async addToQueue(action: OfflineAction, payload: any): Promise<void> {
    try {
      // 기존 큐 가져오기
      const queue = await this.getQueue();
      
      // 새 아이템 추가
      const newItem: QueueItem = {
        id: Date.now().toString(),
        action,
        payload,
        timestamp: Date.now(),
      };
      
      queue.push(newItem);
      
      // 업데이트된 큐 저장
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('오프라인 큐 추가 오류:', error);
    }
  }

  /**
   * 오프라인 작업 큐 가져오기
   * @returns 오프라인 작업 큐
   */
  private static async getQueue(): Promise<QueueItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.QUEUE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('오프라인 큐 로드 오류:', error);
      return [];
    }
  }

  /**
   * 오프라인 작업 큐 처리
   * @param processAction 각 액션을 처리할 콜백 함수
   */
  static async processQueue(
    processAction: (action: OfflineAction, payload: any) => Promise<void>
  ): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      if (queue.length === 0) {
        return;
      }
      
      // 각 큐 아이템 처리
      for (const item of queue) {
        try {
          await processAction(item.action, item.payload);
        } catch (error) {
          console.error(`액션 처리 오류 (${item.action}):`, error);
          // 오류가 발생하더라도 계속 진행
        }
      }
      
      // 처리 완료 후 큐 비우기
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('오프라인 큐 처리 오류:', error);
    }
  }

  /**
   * 오프라인 모드에서 캐시되는 모든 데이터 삭제
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(
        key => key.startsWith(this.DATA_PREFIX) || key === this.QUEUE_KEY
      );
      
      if (offlineKeys.length > 0) {
        await AsyncStorage.multiRemove(offlineKeys);
      }
    } catch (error) {
      console.error('오프라인 데이터 삭제 오류:', error);
    }
  }
}