import React, { useState } from "react";
import "./DateSelector.css";
import { MdOutlineDateRange } from "react-icons/md";
import { DayPicker } from "react-day-picker";
import moment from "moment";

const DateSelector = ({ selectedDate, onDateChange }) => {
  const [openDatePicker, setOpenDatePicker] = useState(false);

  return (
    <div className="date-selector-container">
      <button
        type="button"
        className="date-button"
        onClick={() => setOpenDatePicker(!openDatePicker)}
      >
        <MdOutlineDateRange className="text-lg" />
        &nbsp;
        {selectedDate
          ? moment(selectedDate).format("Do MMM YYYY")
          : moment().format("Do MMM YYYY")}
      </button>

      {openDatePicker && (
        <div className="date-picker-box">
          <button
            className="close-btn"
            onClick={() => setOpenDatePicker(false)}
          >
            &times;
          </button>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate); // dışarı gönder
              setOpenDatePicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DateSelector;
