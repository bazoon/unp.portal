import React, { Component } from "react";
import getImageUrlFromFile from "../../utils/getImageUrlFromFile";

class RenderFiles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileInfo: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;
    const docs = value && value.docs;
    const fileList = value || [];

    if (fileList.length >= 0 && prevState.fileInfo === this.state.fileInfo) {
      const imageUrlPromises = fileList.map(f =>
        getImageUrlFromFile(f.originFileObj)
      );

      const all = Promise.all(imageUrlPromises);
      all.then(fileInfo => {
        if (!this.isUnmounted) {
          this.setState({
            fileInfo
          });
        }
      });
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  isImage(name) {
    return name.match(/.(jpg|jpeg|png|gif)$/i);
  }

  render() {
    return (
      <div className="upload-image__container">
        {this.state.fileInfo.map(f => (
          <div key={f.imageUrl} className="upload-image__wrap">
            {this.isImage(f.name) ? (
              <img className="upload-image" src={f.imageUrl} />
            ) : (
              <div className="upload-image upload-image_raw" />
            )}

            {f.name}
          </div>
        ))}
      </div>
    );
  }
}

export default RenderFiles;
