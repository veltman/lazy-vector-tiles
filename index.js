// Dependencies
var intersect = require("turf-intersect"),
    tilebelt = require("tilebelt"),
    cover = require("tile-cover");

// Initialize with some GeoJSON, min zoom, max zoom
var TileIndex = function(geojson,min,max) {

  this.tiles = {};
  this.min = min;
  this.max = max || min;

  // Add each feature to the tile index
  for (var i = 0; i < geojson.features.length; i++) {

    this.add(geojson.features[i]);

  }

};

// Return the features for a given tile
TileIndex.prototype.get = function(z,x,y) {

  if (!this.tiles[z] || !this.tiles[z][x] || !this.tiles[z][x][y]) {
    return [];
  }

  return this.tiles[z][x][y];

};

// Use .get() for the tiles, but also clip the features to the tile boundaries
TileIndex.prototype.getClipped = function(z,x,y) {

  // Get tile as GeoJSON
  var tileGeo = tilebelt.tileToGeoJSON(x,y,z);

  return this.get(z,x,y).map(function(feature){

    // Clip feature
    return intersect(feature,tileGeo);

  });

}

// Add a feature to the tile index
TileIndex.prototype.add = function(feature) {

  // Get the tiles for the feature
  var matches = this.getTiles(feature.geometry);

  // For each tile, add it to the index
  for (var i = 0; i < matches.length; i++) {
    var x = matches[i][0],
        y = matches[i][1],
        z = matches[i][2];

    // Nest it properly
    this.tiles[z] = this.tiles[z] || {};
    this.tiles[z][x] = this.tiles[z][x] || {};
    this.tiles[z][x][y] = this.tiles[z][x][y] || [];

    this.tiles[z][x][y].push(feature);

  }

};

// Get the full set of covering tiles at each zoom level in the range
TileIndex.prototype.getTiles = function(geometry) {

  var all = [];

  for (var i = this.min; i <= this.max; i++) {
    all = all.concat(cover.tiles(geometry,{min_zoom: i, max_zoom: i}));
  }

  return all;

};

module.exports = TileIndex;