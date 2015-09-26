import d3 from 'd3';
import { createSelector } from 'reselect';
import { placeStrokeWidthRangeScaleSelector, placeRadiusRangeScaleSelector } from './scales';
import { visBoundsSelector, visViewSelector, visScaleSelector } from './vis';
import { tilesLevelSelector } from './tiles';

function computePlaceScales(places, strokeWidthRangeScale, radiusRangeScale, visScale) {
  let strokeWidthRange = strokeWidthRangeScale(visScale),
    radiusRange = radiusRangeScale(visScale);

  let minFrequency = Infinity,
    maxFrequency = -Infinity,
    minDuration = Infinity,
    maxDuration = -Infinity;

  places.forEach(function(place) {
    let { frequency, duration } = place;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
    minDuration = Math.min(minDuration, duration);
    maxDuration = Math.max(maxDuration, duration);
  });

  let strokeWidthDomain = [minFrequency, maxFrequency],
    radiusDomain = [minDuration, maxDuration];

  let strokeWidthScale = d3.scale.pow().exponent(.5)
    .range(strokeWidthRange)
    .domain(strokeWidthDomain);

  let radiusScale = d3.scale.pow().exponent(.5)
    .range(radiusRange)
    .domain(radiusDomain);

  return { strokeWidthScale, radiusScale };
}

function scalePlaces(places, strokeWidthScale, radiusScale) {
  return places
    .map(function(place) {
      let { frequency, duration } = place;

      return place.merge({
        strokeWidth: strokeWidthScale(frequency),
        radius: radiusScale(duration)
      });
    })
    .sortBy(function(place) {
      return place.radius;
    });
}

function positionPlaces(places, visView) {
  return places.map(function(place) {
    return place.set('point', visView(place));
  });
}

function calcDist(nodeOne, nodeTwo) {
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

function clusterPlaces(places) {
  // Check for top most nodes, all others will be hidden.
  return places.withMutations(function(places) {
    let placesArray = places.toList().toJS();

    for (var i = placesArray.length - 1; i >= 0; i--) {
      var placeOne = placesArray[i];

      if (placeOne.calculated)
        continue;

      placeOne.calculated = true;

      for (var i = 0; i < placesArray.length; i++) {
        var placeTwo = placesArray[i];

        if (placeTwo.calculated)
          continue;

        if (calcDist(placeOne, placeTwo) < (placeOne.radius - placeTwo.radius)) {
          placeTwo.calculated = true;

          places.setIn([placeTwo.id, 'visible'], false);
        }
      }

      places.setIn([placeOne.id, 'visible'], true);
    }
  });
}

function boundPlaces(places, visBounds) {
  return places.map(function(place) {
    if (!place.visible)
      return place;

    return place.set('visible', visBounds.contains(place.point));
  });
}

function tilePlaces(places, tiles) {
  return places.map(function(place, id) {
    let tile = tiles.get(id);

    return place.set('tile', tile);
  });
}

const placesSelector = state => state.places;

export const placeScalesSelector = createSelector(
  [
    placesSelector,
    placeStrokeWidthRangeScaleSelector,
    placeRadiusRangeScaleSelector,
    visScaleSelector
  ],
  computePlaceScales
);

export const placeStrokeWidthScaleSelector = createSelector(
  [
    placeScalesSelector
  ],
  (state) => state.strokeWidthScale
);

export const placeRadiusScaleSelector = createSelector(
  [
    placeScalesSelector
  ],
  (state) => state.radiusScale
);

export const scaledPlacesSelector = createSelector(
  [
    placesSelector,
    placeStrokeWidthScaleSelector,
    placeRadiusScaleSelector
  ],
  scalePlaces
);

export const positionedPlacesSelector = createSelector(
  [
    scaledPlacesSelector,
    visViewSelector
  ],
  positionPlaces
);

export const clusteredPlacesSelector = createSelector(
  [
    positionedPlacesSelector
  ],
  clusterPlaces
);

export const boundedPlacesSelector = createSelector(
  [
    clusteredPlacesSelector,
    visBoundsSelector
  ],
  boundPlaces
);

export const tiledPlacesSelector = createSelector(
  [
    boundedPlacesSelector,
    tilesLevelSelector
  ],
  tilePlaces
);

export default placesSelector;