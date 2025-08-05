import React, { useState, useEffect } from "react";
import Navbar from "../../components/Input/navbar";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import TravelStoryCard from "../../components/Cards/TravelStoryCard";
import { ToastContainer, toast } from "react-toastify";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import AddEditTravelStory from "./AddEditTravelStory";
import { ViewTravelStory } from "./ViewTravelStory";
import { EmptyCard } from "../../components/Cards/EmptyCard";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import moment from "moment";
import { FilterInfoTitle } from "../../components/Cards/FilterInfoTitle";

import { getEmptyCardImg, getEmptyCardMessage } from "../../utils/helper";

export default function Home() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShow: false,
    type: "add",
    data: null,
  });
  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data?.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Get user info error:", error);
      }
    }
  };

  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data?.stories) {
        setAllStories(response.data.stories);
      } else {
        setAllStories([]);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setAllStories([]);
    }
  };

  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  const updateIsFavourite = async (storyData) => {
    try {
      const response = await axiosInstance.put(
        `/update-is-favourite/${storyData._id}`,
        { isFavourite: !storyData.isFavourite }
      );
      if (response.data?.story) {
        toast.success("Favorite status updated successfully!");
        if (filterType === "search" && searchQuery) {
          onSearchStory(searchQuery);
        } else if (filterType === "date") {
          filterStoriesByDate(dateRange);
        } else {
          getAllTravelStories();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Update favorite error:", error);
    }
  };

  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-story/" + storyId);
      if (response.data && !response.data.error) {
        toast.error("Story Deleted Succesfully");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllTravelStories();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get("/search", {
        params: {
          query,
        },
      });
      if (response.data && response.data.stories) {
        setFilterType("search");
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setFilterType("");
    getAllTravelStories();
  };

  const handleEdit = (data) => {
    setOpenAddEditModal({
      isShow: true,
      type: "edit",
      data: data,
    });
  };

  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? new Date(day.from).getTime() : null;
      const endDate = day.to ? new Date(day.to).getTime() : null;

      if (startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: { startDate, endDate },
        });

        if (response.data && response.data.stories) {
          setFilterType("date");
          setAllStories(response.data.stories);
        }
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  };

  const resetFilter = () => {
    setDateRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  };

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
        />

        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div
                className="grid grid-cols-3 gap-x-2 gap-y-2"
                style={{
                  maxWidth: "1050px",
                  marginLeft: 0,
                  paddingLeft: 0,
                  paddingBottom: "30px",
                }}
              >
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    visitedDate={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onClick={() => handleViewStory(item)}
                    onFavoriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                imgSrc={getEmptyCardImg(filterType)}
                message={getEmptyCardMessage(filterType)}
              />
            )}

            <div className="flex justify-end items-start -mt-90 ml-40">
              <div className="fixed top-25 right-10 z-50 w-[320px]">
                <div className="bg-white border border-slate-200 shadow-lg shadow-slate-500/60 rounded-lg">
                  <div className="p-3">
                    <DayPicker
                      captionLayout="dropdown-buttons"
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDayClick}
                      pagedNavigation
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openAddEditModal.isShow}
        onRequestClose={() =>
          setOpenAddEditModal({ isShow: false, type: "add", data: null })
        }
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: 999 },
        }}
        appElement={document.getElementById("root")}
        className="model-box scrollbar"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ isShow: false, type: "add", data: null })
          }
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => setOpenViewModal({ isShown: false, data: null })}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: 999 },
        }}
        appElement={document.getElementById("root")}
        className="model-box scrollbar"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data || null);
          }}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-[#05B6D3] hover:bg-cyan-400 fixed right-10 bottom-10 z-50 cursor-pointer"
        onClick={() =>
          setOpenAddEditModal({ isShow: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-2xl text-white" />
      </button>

      <ToastContainer />
    </>
  );
}
