import React from "react";

const RenderLink = ({ attributes, content }) => {
  const { href, ...props } = attributes;

  return (
    <a href={href} target="_blank" className="underline" {...props}>
      {content}
    </a>
  );
};

export default RenderLink;
