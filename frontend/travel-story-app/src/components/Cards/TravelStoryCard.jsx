import React from "react";
import { FaHeart } from "react-icons/fa6";
import { GrMapLocation } from "react-icons/gr";
import moment from "moment";

export default function TravelStoryCard({
  imgUrl,
  title,
  story,
  visitedDate,
  visitedLocation,
  isFavourite,
  onClick,
  onEdit,
  onFavoriteClick,
}) {
  return (
    <div
      className="group relative flex flex-col max-w-sm w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Travel story: ${title}`}
    >
      {/* Üst görsel */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img
          src={imgUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          loading="lazy"
        />

        {/* Favori butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onFavoriteClick) onFavoriteClick();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md shadow hover:bg-white transition"
          aria-label={
            isFavourite ? "Remove from favorites" : "Add to favorites"
          }
          title={isFavourite ? "Favorilerden kaldır" : "Favorilere ekle"}
        >
          <FaHeart
            className={`transition-colors duration-300 ${
              isFavourite ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
            size={20}
          />
        </button>
      </div>

      {/* İçerik Alanı */}
      <div className="flex flex-col flex-1 p-4">
        {/* Başlık */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
          {title}
        </h3>

        {/* Hikaye */}
        <p className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-2">
          {story}
        </p>

        {/* Lokasyon ve Tarih */}
        <div className="mt-4 text-sm text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <GrMapLocation className="text-gray-400" size={16} />
            <span className="truncate">
              {Array.isArray(visitedLocation) && visitedLocation.length > 0
                ? visitedLocation.join(", ")
                : "Bilinmeyen Konum"}
            </span>
          </div>
          <div className="italic text-xs text-gray-400">
            {visitedDate
              ? moment(visitedDate).format("Do MMM YYYY")
              : "Tarih Yok"}
          </div>
        </div>

        {/* Edit butonu */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="mt-4 text-sm text-blue-600 hover:underline self-start"
            aria-label="Edit Story"
          >
            Düzenle
          </button>
        )}
      </div>
    </div>
  );
}
