import React, { useEffect, useRef, useState } from "react";
import { FaRegFileImage } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

export default function ImageSelector({ image, SetImage, handleDeleteImg }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      SetImage(file);
    }
  };
  const handleRemoveImage = () => {
    SetImage(null);
    handleDeleteImg();
  };
  useEffect(() => {
    if (typeof image === "string") {
      setPreviewUrl(image);
    } else if (image) {
      setPreviewUrl(URL.createObjectURL(image));
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  // Bu if bloğu JSX içinde olamaz, useEffect içinde olmalı veya component dışında
  useEffect(() => {
    if (previewUrl && typeof previewUrl === "string" && !image) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl, image]);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <button
          className="w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50"
          onClick={onChooseFile}
          type="button"
          style={{ marginTop: "20px" }}
        >
          <div className="w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border-cyan-100">
            <FaRegFileImage className="text-xl text-cyan-500" />
          </div>
          <p className="text-sm text-slate-500">Browse Image Files To Upload</p>
        </button>
      ) : (
        <div className="w-full relative cursor-pointer">
          <img
            src={previewUrl}
            alt="Selected"
            className="w-full h-[500px] object-cover rounded-lg cursor-pointer"
          />

          <button
            className="btn-small btn-delete absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-400
            cursor-pointer"
            onClick={handleRemoveImage}
            type="button"
          >
            <MdDeleteOutline className="text-lg text-[#05b6d3]" />
          </button>
        </div>
      )}
    </div>
  );
}
