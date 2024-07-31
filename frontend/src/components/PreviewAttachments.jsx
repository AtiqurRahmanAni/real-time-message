import React from "react";
import CloseButton from "./CloseButton";

const PreviewAttachments = ({ attachments, onRemoveAttachment }) => {
  return (
    <div className="flex gap-2.5 flex-wrap mb-2">
      {attachments.map((item, idx) => (
        <div key={idx}>
          <div className="relative">
            <CloseButton
              className="absolute -right-[10px] -top-[10px]"
              onClick={() => onRemoveAttachment(idx)}
            />
          </div>
          <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden">
            <img
              className="w-full h-full object-fill"
              src={URL.createObjectURL(item)}
              alt="attachment"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(PreviewAttachments);
