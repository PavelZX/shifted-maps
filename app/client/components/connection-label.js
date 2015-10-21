import React, { Component } from 'react';

class ConnectionLabel extends Component {
  shouldComponentUpdate(nextProps) {
    let { edge } = this.props,
      nextEdge = nextProps.edge;

    return edge.label !== nextEdge.label || edge.fromPoint !== nextEdge.fromPoint || edge.toPoint !== nextEdge.toPoint;
  }

  render() {
    let { edge } = this.props;

    if (edge.label == null)
      return null;

    let { fromPoint, toPoint } = edge;

    let from = L.point(fromPoint.get('x'), fromPoint.get('y')),
      to = L.point(toPoint.get('x'), toPoint.get('y'));

    let vector = to.subtract(from),
      center = from.add(vector.divideBy(2));

    let rotate = Math.atan2(vector.y, vector.x) * 180 / Math.PI;

    if (rotate > 90) rotate -= 180;
    else if (rotate < -90) rotate += 180;

    let transform = `translate(${center.x}, ${center.y}) rotate(${rotate})`;

    return (
      <g className="connection-label" transform={transform}>
        <text className="connection-label-stroke">{edge.label}</text>
        <text>{edge.label}</text>
      </g>
    );
  }
}

export default ConnectionLabel;