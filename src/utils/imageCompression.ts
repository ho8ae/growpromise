// src/utils/imageCompression.ts
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * 이미지 파일 크기를 바이트 단위로 반환
 */
export const getImageSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists ? (fileInfo.size || 0) : 0;
  } catch (error) {
    console.error('이미지 크기 확인 실패:', error);
    return 0;
  }
};

/**
 * 바이트를 MB로 변환
 */
export const bytesToMB = (bytes: number): number => {
  return bytes / (1024 * 1024);
};

/**
 * 이미지를 적극적으로 압축하는 함수
 * 목표: 2MB 이하의 이미지 생성
 */
export const compressImageForUpload = async (
  uri: string,
  targetSizeMB: number = 2
): Promise<string> => {
  try {
    console.log('🔄 이미지 압축 시작...');
    
    // 원본 이미지 크기 확인
    const originalSize = await getImageSize(uri);
    const originalSizeMB = bytesToMB(originalSize);
    
    console.log(`📏 원본 이미지 크기: ${originalSizeMB.toFixed(2)}MB`);
    
    // 이미 목표 크기보다 작으면 그대로 반환
    if (originalSizeMB <= targetSizeMB) {
      console.log('✅ 이미지가 이미 적절한 크기입니다.');
      return uri;
    }
    
    let compressedUri = uri;
    let currentQuality = 0.8;
    let maxWidth = 1024;
    
    // 파일 크기에 따른 초기 설정
    if (originalSizeMB > 10) {
      currentQuality = 0.4;
      maxWidth = 600;
    } else if (originalSizeMB > 5) {
      currentQuality = 0.6;
      maxWidth = 800;
    }
    
    const targetSizeBytes = targetSizeMB * 1024 * 1024;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      console.log(`🔄 압축 시도 ${attempts}/${maxAttempts}: 품질 ${currentQuality}, 최대 폭 ${maxWidth}px`);
      
      // 이미지 압축 실행
      const compressedResult = await ImageManipulator.manipulateAsync(
        compressedUri,
        [
          { resize: { width: maxWidth } }
        ],
        {
          compress: currentQuality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      compressedUri = compressedResult.uri;
      const compressedSize = await getImageSize(compressedUri);
      const compressedSizeMB = bytesToMB(compressedSize);
      
      console.log(`📐 압축 ${attempts}회 후 크기: ${compressedSizeMB.toFixed(2)}MB`);
      
      // 목표 크기 달성하면 종료
      if (compressedSize <= targetSizeBytes) {
        console.log(`✅ 목표 크기 달성: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);
        break;
      }
      
      // 다음 시도를 위한 설정 조정
      if (attempts < maxAttempts) {
        currentQuality = Math.max(0.2, currentQuality - 0.15);
        maxWidth = Math.max(400, maxWidth - 150);
      }
    }
    
    // 최종 결과 로깅
    const finalSize = await getImageSize(compressedUri);
    const finalSizeMB = bytesToMB(finalSize);
    
    console.log(`🏁 최종 압축 완료: ${originalSizeMB.toFixed(2)}MB → ${finalSizeMB.toFixed(2)}MB (${attempts}회 시도)`);
    
    return compressedUri;
    
  } catch (error) {
    console.error('❌ 이미지 압축 실패:', error);
    // 압축 실패 시 원본 반환
    return uri;
  }
};

/**
 * 카메라로 촬영한 이미지를 압축
 */
export const compressCameraImage = async (uri: string): Promise<string> => {
  return compressImageForUpload(uri, 1.5); // 카메라 이미지는 1.5MB 목표
};

/**
 * 갤러리에서 선택한 이미지를 압축
 */
export const compressGalleryImage = async (uri: string): Promise<string> => {
  return compressImageForUpload(uri, 2); // 갤러리 이미지는 2MB 목표
};

/**
 * 이미지 압축 상태를 사용자에게 보여주기 위한 정보
 */
export interface CompressionInfo {
  originalSizeMB: number;
  compressedSizeMB: number;
  reductionPercentage: number;
}

/**
 * 압축 전후 정보를 반환하는 함수
 */
export const getCompressionInfo = async (
  originalUri: string,
  compressedUri: string
): Promise<CompressionInfo> => {
  const originalSize = await getImageSize(originalUri);
  const compressedSize = await getImageSize(compressedUri);
  
  const originalSizeMB = bytesToMB(originalSize);
  const compressedSizeMB = bytesToMB(compressedSize);
  const reductionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
  
  return {
    originalSizeMB,
    compressedSizeMB,
    reductionPercentage
  };
};