import React from "react";
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md";
import { GrMapLocation } from "react-icons/gr";
import moment from "moment";
import "./ViewTravelStory.css";

export const ViewTravelStory = ({
  onClose,
  storyInfo,
  onDeleteClick,
  onEditClick,
}) => {
  return (
    <div className="modal-overlay">
      <div className="view-story-container">
        <div className="view-story-header">
          <div className="flex gap-2">
            <button className="view-story-btn" onClick={onEditClick}>
              <MdUpdate /> Update Story
            </button>
            <button
              className="view-story-btn btn-delete"
              onClick={onDeleteClick}
            >
              <MdDeleteOutline /> Delete
            </button>
          </div>
          <button className="view-close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="view-story-content">
          <h2 className="text-2xl text-slate-950">{storyInfo?.title}</h2>

          <div className="inline-flex items-center gap-2 text-[13px] text-cyan-800 bg-cyan-200/40 rounded px-2 py-1">
            <GrMapLocation className="text-sm" />
            {storyInfo?.visitedLocation?.map((item, index) => (
              <span key={index}>
                {item}
                {index !== storyInfo.visitedLocation.length - 1 && ","}{" "}
              </span>
            ))}
          </div>

          <p className="flex items-center gap-2 mt-2 text-sm text-slate-700">
            <strong>Date:</strong>
            <span>
              {storyInfo?.visitedDate &&
                moment(storyInfo.visitedDate).format("Do MMM YYYY")}
            </span>
          </p>
        </div>

        <img
          src={storyInfo?.imageUrl}
          alt="Story"
          className="view-story-image"
        />
        <div className="mt-4">
          <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">
            {storyInfo.story}
          </p>
        </div>
      </div>
    </div>
  );
};
