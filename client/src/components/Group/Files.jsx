import React from "react";
import FileIcon from "../../../images/file";

export default props => {
  const files = props.files || [];
  if (files.length === 0) {
    return null;
  }
  return (
    <ul style={{ padding: 0 }}>
      {files.map(file => {
        return (
          <li key={file.url} className="group__file">
            <FileIcon />
            <a download href={file.url}>
              {file.name}
            </a>
            <span
              onClick={() => props.onDelete(file.id)}
              className="group__file-remove"
            >
              x
            </span>
          </li>
        );
      })}
    </ul>
  );
};
