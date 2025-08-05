import INDIR1_IMG from "../assets/images/indir1.png";
import INDIR2_IMG from "../assets/images/indir2.png";
import INDIR_IMG from "../assets/images/indir.png";
// Eğer NO_SEARCH_DATA_IMG, NO_FILTER_DATA_IMG, ADD_STORY_IMG varsa onları da import etmen lazım.
// Örnek:
// import { NO_SEARCH_DATA_IMG, NO_FILTER_DATA_IMG, ADD_STORY_IMG } from "../assets/images";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/); // Birden fazla boşluklara karşı böl
  let initials = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};

// Burada parametre sadece string filterType olmalı
export const getEmptyCardMessage = (filterType) => {
  switch (filterType) {
    case "search":
      return "Oops! No stories found matching your search.";
    case "date":
      return "No stories found in the given date range.";
    default:
      return "Start creating your first Travel Story! Click the 'add' button to jot down your thoughts, ideas, and memories. Let's get started!";
  }
};

// Burada da aynı şekilde parametre string olmalı
export const getEmptyCardImg = (filterType) => {
  switch (filterType) {
    case "search":
      return INDIR1_IMG; // Arama sonucu yoksa Atatürk resmi göster
    case "date":
      return INDIR2_IMG; // Tarihe göre filtre sonuç yoksa da Atatürk resmi göster
    default:
      return INDIR_IMG; // Diğer durumlarda da Atatürk resmi göster
  }
};
