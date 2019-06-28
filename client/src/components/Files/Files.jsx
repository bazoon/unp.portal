import React from "react";
import FileIcon from "../../../images/file";
import "./Files.less";

export default ({ files = [], onDelete = () => {} }) => {
  if (files.length === 0) {
    return null;
  }
  return (
    <div className="files">
      <ul style={{ padding: 0 }}>
        {files.map(file => {
          return (
            <li key={file.url} className="file">
              <FileIcon />
              <a download href={file.url}>
                {file.name}
              </a>
              <span onClick={() => onDelete(file.id)} className="file-remove">
                x
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
