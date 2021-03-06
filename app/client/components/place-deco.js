import React, { Component } from 'react';
import PlaceCircle from './place-circle';

class PlaceDeco extends Component {
  shouldComponentUpdate(nextProps) {
    let node = this.props.node,
      nextNode = nextProps.node;

    return node.strokeWidth !== nextNode.strokeWidth;
  }

  render() {
    let { node } = this.props;

    return (
      <g className="place-deco" strokeWidth={node.strokeWidth}>
        <use xlinkHref={'#' + PlaceCircle.createId(node)} />
      </g>
    );
  }
}

export default PlaceDeco;