import React, { useState, useEffect } from "react";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance"; // Bu varsa problem yok
import "./AddEditTravelStory.css";
import { MdAdd } from "react-icons/md";
import DateSelector from "../../components/Input/DateSelector";
import ImageSelector from "../../components/Input/ImageSelector";
import Taginput from "../../components/Input/Taginput";
import { toast } from "react-toastify";

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || []
  );
  const [visitedDate, setVisitedDate] = useState(
    storyInfo?.visitedDate ? new Date(storyInfo.visitedDate) : new Date()
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (type === "edit" && storyInfo) {
      setTitle(storyInfo.title || "");
      setStory(storyInfo.story || "");
      setStoryImg(storyInfo.imageUrl || null);
      setVisitedLocation(storyInfo.visitedLocation || []);
      setVisitedDate(
        storyInfo.visitedDate ? moment(storyInfo.visitedDate).toDate() : null
      );
    } else {
      // Temizle ekleme modunda
      setTitle("");
      setStory("");
      setStoryImg(null);
      setVisitedLocation([]);
      setVisitedDate(null);
    }
  }, [storyInfo, type]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    console.log(file);
    try {
      const res = await axiosInstance.post("/image-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error("Image upload failed", error);
      return {};
    }
  };

  const addNewTravelStory = async () => {
    setError(""); // Önceki hataları temizle
    try {
      let imageUrl = "";
      if (storyImg && typeof storyImg !== "string") {
        const imgUploadRes = await uploadImage(storyImg);
        imageUrl = imgUploadRes.imageUrl || "";
      } else if (typeof storyImg === "string") {
        imageUrl = storyImg;
      }

      const response = await axiosInstance.post("/add-travel-story", {
        title,
        story,
        imageUrl,
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
      });

      console.log("API response:", response);

      if (response.data && response.data.travelStory) {
        toast.success("Story added successfully 🎉");
        getAllTravelStories();
        onClose();
      } else {
        throw new Error("TravelStory did not arrive from API");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const updateTravelStory = async () => {
    const storyId = storyInfo._id;
    setError("");
    try {
      let imageUrl = "";

      if (storyImg && typeof storyImg !== "string") {
        const imgUploadRes = await uploadImage(storyImg);
        imageUrl = imgUploadRes.imageUrl || "";
      } else if (typeof storyImg === "string") {
        imageUrl = storyImg;
      } else {
        imageUrl = storyInfo.imageUrl || "";
      }

      // Burada toISOString() yerine moment kullandık
      const formattedDate = visitedDate
        ? moment(visitedDate).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD");

      let postData = {
        title,
        story,
        imageUrl,
        visitedLocation,
        visitedDate: formattedDate,
      };

      const response = await axiosInstance.put(
        "/edit-story/" + storyId,
        postData
      );

      console.log("API response:", response);

      if (response.data && response.data.story) {
        toast.success("Story updated successfully 🎉");
        getAllTravelStories();
        onClose();
      } else {
        throw new Error("No updated story information received from API");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleDeleteStoryImg = async () => {
    try {
      // Mevcut storyImg'yi kullanarak resmi sil
      const deleteImgRes = await axiosInstance.delete("/delete-image", {
        params: { imageUrl: storyImg },
      });

      if (deleteImgRes.data) {
        const storyId = storyInfo._id;
        const postData = {
          title,
          story,
          visitedLocation,
          visitedDate: moment().format("YYYY-MM-DD"),
          imageUrl: "", // Resmi sildik, boş olarak gönderiyoruz
        };

        const response = await axiosInstance.put(
          "/edit-story/" + storyId,
          postData
        );

        if (response.data && response.data.story) {
          toast.success(
            "The image has been successfully deleted and the story has been updated."
          );
          getAllTravelStories();
          onClose();
        } else {
          throw new Error("No updated story information received from API");
        }

        setStoryImg(null);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleAddOrUpdateClick = () => {
    console.log("Input Data:", {
      title,
      storyImg,
      story,
      visitedDate,
      visitedLocation,
    });
    if (!title || !story) {
      setError("Please enter a title and story.");
      return;
    }

    setError("");
    if (type === "edit") {
      updateTravelStory();
    } else {
      addNewTravelStory();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="story-buttons">
          <button className="story-btn" onClick={handleAddOrUpdateClick}>
            {type === "add" ? (
              <>
                <MdAdd className="icon" /> ADD STORY
              </>
            ) : (
              <>UPDATE STORY</>
            )}
          </button>
        </div>

        <h5>{type === "add" ? "ADD STORY" : "UPDATE STORY"}</h5>

        {error && (
          <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
        )}

        <div className="form-group">
          <label
            htmlFor="title"
            className="input-label"
            style={{ marginTop: "20px" }}
          >
            TITLE
          </label>
          <input
            id="title"
            type="text"
            className="input-field"
            placeholder="A Day at the Great Wall"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />

          <label
            htmlFor="date"
            className="input-label"
            style={{ marginTop: "20px" }}
          >
            DATE
          </label>
          <DateSelector
            selectedDate={visitedDate}
            onDateChange={setVisitedDate}
          />
        </div>

        <ImageSelector
          image={storyImg}
          SetImage={setStoryImg}
          handleDeleteImg={handleDeleteStoryImg}
        />

        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label">STORY</label>
          <textarea
            type="text"
            className="text-slate-950 outline-none bg-slate-50 p-2 rounded"
            placeholder="Your Story"
            rows={10}
            value={story}
            onChange={({ target }) => setStory(target.value)}
          />
        </div>

        <div className="pt-4">
          <label className="input-label">VISIT LOCATIONS</label>
          <Taginput tags={visitedLocation} setTags={setVisitedLocation} />
        </div>
      </div>
    </div>
  );
};

export default AddEditTravelStory;
