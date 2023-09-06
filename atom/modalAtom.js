import { atom } from "recoil";

export const captureImageModal = atom({
  key: "captureImageModal",
  default: false,
});

export const attendanceModal = atom({
  key: "attendanceModal",
  default: false,
});

export const addCourse = atom({
  key: "addCourse",
  default: false,
});

export const userImageUrl = atom({
  key: "userImageUrl",
  default: '',
});