import React from "react";
import { getInitials } from "../../utils/helper"; // doğru yolu yazmalısın

export default function ProfileInfo({ userInfo, onLogout }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center rounded-full text-gray-900 font-medium bg-gray-100">
        {getInitials(userInfo ? userInfo.fullName : "")}
      </div>
      <div>
        <p className="text-sm font-medium">{userInfo?.fullName || ""}</p>
        <button
          className="text-sm text-slate-700 underline cursor-pointer"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
