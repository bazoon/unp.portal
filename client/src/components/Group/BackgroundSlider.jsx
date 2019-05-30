import React, { Component } from "react";
import NextIcon from "../../../images/next";
import PrevIcon from "../../../images/prev";

class BackgroundSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0
    };
  }

  handlePrev = e => {
    e.nativeEvent.stopImmediatePropagation();
    const { backgrounds } = this.props;
    const { currentIndex } = this.state;

    if (currentIndex > 0) {
      this.setState({
        currentIndex: currentIndex - 1
      });
    }
  };

  handleNext = e => {
    e.nativeEvent.stopImmediatePropagation();
    const { backgrounds } = this.props;
    const { currentIndex } = this.state;

    if (currentIndex < backgrounds.length - 5) {
      this.setState({
        currentIndex: currentIndex + 1
      });
    }
  };

  render() {
    const { backgrounds } = this.props;
    const { currentIndex } = this.state;
    const visibleImages = backgrounds.slice(currentIndex, currentIndex + 5);

    return (
      <div className="group__feed-bg-slider-wrap">
        <div onClick={this.handlePrev} className="group__feed-bg-slider-prev">
          <PrevIcon />
        </div>
        <div onClick={this.handleNext} className="group__feed-bg-slider-next">
          <NextIcon />
        </div>
        <div className="group__feed-bg-slider">
          {visibleImages.map(bg => {
            return (
              <img
                onClick={() => this.props.onSelect(bg.id)}
                style={{ width: "60px", height: "60px" }}
                alt={bg.id}
                key={bg.id}
                className="group__feed-background"
                src={bg.background}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default BackgroundSlider;
