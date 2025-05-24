import client from './client';
import auth from './modules/auth';
import user from './modules/user';
import promise from './modules/promise';
import reward from './modules/reward';
import sticker from './modules/sticker';
import notification from './modules/notification';
import plant from './modules/plant'; // 식물 API 모듈 추가
import gallery from './modules/gallery'; // 갤러리 API 모듈 추가

// API 클라이언트와 모든 모듈을 하나로 내보냄
const api = {
  client,  // 기본 클라이언트
  auth,    // 인증 관련 API
  user,    // 사용자 관련 API
  promise, // 약속 관련 API
  reward,  // 보상 관련 API
  sticker, // 스티커 관련 API
  notification, // 알림 관련 API
  plant,   // 식물 관련 API (추가됨)
  gallery, // 갤러리 관련 API (추가됨)
};

export default api;