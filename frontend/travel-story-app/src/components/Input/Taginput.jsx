import React, { useState } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';
import { GrMapLocation } from "react-icons/gr";

export default function Taginput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState('');

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className='flex flex-col gap-2 mt-3'>
      {tags.length > 0 && (
        <div className='flex items-center gap-2 flex-wrap'>
          {tags.map((tag, index) => (
            <span key={index} className='flex items-center gap-1 text-sm text-cyan-600 bg-cyan-200/40 px-2 py-1 rounded'>
              <GrMapLocation className="text-sm" />
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className='flex items-center gap-2'>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='text-sm bg-transparent border px-3 py-2 rounded outline-none'
          placeholder='Add Location'
        />
        <button
          className='w-8 h-8 flex items-center justify-center rounded border border-cyan-500 hover:bg-cyan-500'
          onClick={addNewTag}
        >
          <MdAdd className="text-2xl text-cyan-500 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
