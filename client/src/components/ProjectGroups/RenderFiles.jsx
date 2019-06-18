import React, { Component } from "react";
import getImageUrlFromFile from "../../utils/getImageUrlFromFile";

class RenderFiles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrls: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;
    const docs = value && value.docs;
    const fileList = value || [];

    if (fileList.length >= 0 && prevState.imageUrls === this.state.imageUrls) {
      const imageUrlPromises = fileList.map(f =>
        getImageUrlFromFile(f.originFileObj)
      );
      const all = Promise.all(imageUrlPromises);
      all.then(imageUrls => {
        this.setState({
          imageUrls
        });
      });
    }
  }

  render() {
    return (
      <div className="upload-image__container">
        {this.state.imageUrls.map(url => (
          <div key={url} className="upload-image__wrap">
            <img className="upload-image" src={url} />
          </div>
        ))}
      </div>
    );
  }
}

export default RenderFiles;
