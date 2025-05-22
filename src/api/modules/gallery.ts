// src/api/modules/gallery.ts
import { apiRequest } from '../client';

// 갤러리 이미지 타입
export interface GalleryImage {
  id: string;
  promiseId: string;
  promiseTitle: string;
  imageUrl: string;
  verificationTime: string;
  childId: string;
  childName: string;
  childProfileImage?: string;
  verificationDescription?: string;
  isFavorite: boolean;
}

// 갤러리 API 함수들
const galleryApi = {
  // 부모: 모든 자녀의 인증 이미지 목록 조회
  getParentGalleryImages: async (
    childId?: string // 선택적 자녀 ID로 필터링
  ): Promise<GalleryImage[]> => {
    try {
      let url = '/gallery';
      
      if (childId) {
        url += `?childId=${childId}`;
      }
      
      return await apiRequest<GalleryImage[]>('get', url);
    } catch (error) {
      console.error('갤러리 이미지 조회 오류:', error);
      return [];
    }
  },
  
  // 자녀: 자신의 인증 이미지 목록 조회
  getChildGalleryImages: async (): Promise<GalleryImage[]> => {
    try {
      return await apiRequest<GalleryImage[]>('get', '/gallery/child');
    } catch (error) {
      console.error('자녀 갤러리 이미지 조회 오류:', error);
      return [];
    }
  },
  
  // 갤러리 이미지 즐겨찾기 토글
  toggleImageFavorite: async (
    imageId: string, 
    isFavorite: boolean
  ): Promise<void> => {
    try {
      await apiRequest<GalleryImage>(
        'put', 
        `/gallery/${imageId}/favorite`,
        { isFavorite }
      );
    } catch (error) {
      console.error('갤러리 이미지 즐겨찾기 토글 오류:', error);
      throw error;
    }
  },
  
  // 갤러리 이미지 삭제
  deleteImage: async (imageId: string): Promise<void> => {
    try {
      await apiRequest<void>('delete', `/gallery/${imageId}`);
    } catch (error) {
      console.error('갤러리 이미지 삭제 오류:', error);
      throw error;
    }
  },
  
  // 갤러리 이미지 상세 조회
  getImageById: async (imageId: string): Promise<GalleryImage> => {
    try {
      return await apiRequest<GalleryImage>('get', `/gallery/${imageId}`);
    } catch (error) {
      console.error('갤러리 이미지 상세 조회 오류:', error);
      throw error;
    }
  }
};

export default galleryApi;