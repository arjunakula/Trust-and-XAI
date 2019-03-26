// http://bl.ocks.org/MoritzStefaner/1377729

function MSEEParseGraph(container, width, height) {
  this.color = d3.scale.category20();
  this.color_map = {
    'default': 0,
    'Person': 1,
    'bike': 2,
    'car': 3,
    'small_object': 4,
    'ball': 5
  };
  var _self = this;
  this.container = container;
  this.width = width;
  this.height = height;

  this.force = d3.layout.force()
    .charge(-500)
    .linkDistance(80)
    .size([width, height]);

  this.svg = d3.select(_self.container).append("svg")
    .attr("width", width)
    .attr("height", height);

  this.clear = function(){
    // $( _self.container ).empty();
    var container = d3.select(_self.container);
    if (!container.select("svg").empty())
        container.selectAll("svg").remove();

    this.svg = d3.select(_self.container).append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
  };

  this.drawGraph = function(graph){
    _self.force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    var link = _self.svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", 3);

    var node = _self.svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .call(_self.force.drag);

    node.append("circle")
      .attr("class", "node")
      .attr("r", 8)
      .style("fill", function(d) {
        if (d.type && _self.color_map[d.type]){
          return _self.color(_self.color_map[d.type]);
        } else {
          return _self.color(0);
        }
      });

    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.title || d.type; })
        .style("font-family", "Arial").style("font-size", 12);

    link.append("title")
      .text(function(d) { return d.type; });

    _self.force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      // node.attr("cx", function(d) { return d.x; })
      //   .attr("cy", function(d) { return d.y; });

      node.attr("transform", function(d) {
       return "translate(" + d.x + "," + d.y + ")";
      });
    });
  }
}

function MSEEOntologyGraph(container, width, height) {
  this.color = d3.scale.category20();
  this.color_map = {
    'default': 0,
    'node-object': 1,
    'node-attr': 2,
    'node-rel': 3,
    'node-attribute': 4,
    'node-action': 5,
    'node-behavior': 6,
    'node-interaction': 7,
    'node-fluent': 8,
    'node-spatial': 9,
    'node-temporal': 10,
    'node-social': 11,
    'node-cognitive': 12,
  };
  var _self = this;
  this.width = width;
  this.height = height;
  this.container = container;

  this.force = d3.layout.force()
    .charge(-120)
    .linkDistance(70)
    .size([width, height]);

  this.svg = d3.select(this.container).append("svg")
    .attr("width", width)
    .attr("height", height);

  this.try = function(){
    var graph = {
      "nodes": [
        {
          "id": "node-1",
          "label": "Person"
        },
        {
          "id": "node-2",
          "label": "Walking"
        },
        {
          "id": "node-3",
          "label": "Moving"
        }
      ],
      "links": [
        {
          "id": "link-1",
          "source": 0,
          "target": 1,
          "type": "AGENT",
          "active": false
        },
        {
          "id": "link-2",
          "source": 1,
          "target": 2,
          "type": "AGENT",
          "active": false
        }
      ]
    };
    _self.drawGraph(graph);
  }

  this.highlightNode = function(ids){
    for (var i = 0; i < ids.length; i++){
      _self.svg.select(ids[i])
        .style("fill-opacity", 0.9)
        .style("stroke", "#FCBD00")
        .style("stroke-width", 4)
    }
  }

  this.highlightLink = function(ids){
    for (var i = 0; i < ids.length; i++){
      _self.svg.select(ids[i])
        .style("stroke", "#FCBD00")
        .style("stroke-opacity", 1.0);
    }
  }

  this.clear = function(){
    _self.svg.selectAll("*").remove();
  }

  this.drawGraph = function(graph){
    console.log(graph);
    _self.force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    var link = _self.svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("id", function(d){ return d.id; })
      .attr("class", "link")
      .style("stroke-width", 3);

    var node = _self.svg.selectAll(".node")
      .data(graph.nodes).enter()
      .append("circle")
      .attr("id", function(d){ return d.id; })
      .attr("class", "node")
      .attr("r", 8)
      .call(_self.force.drag)
      .style("fill-opacity", 0.6)
      .style("fill", function(d) {
        if (d.class && _self.color_map[d.class]){
          return _self.color(_self.color_map[d.class]);
        } else {
          return _self.color(0);
        }
      });

    link.append("title")
      .text(function(d) { return d.type; });

    // Labels for nodes
    var labelAnchors = [];
    var labelAnchorLinks = [];
    for(var i = 0; i < graph.nodes.length; i++) {
      labelAnchors.push({
        node : graph.nodes[i]
      });
      labelAnchors.push({
        node : graph.nodes[i]
      });
      labelAnchorLinks.push({
        source : i * 2,
        target : i * 2 + 1,
      });
    }
    var force2 = d3.layout.force()
      .nodes(labelAnchors)
      .links(labelAnchorLinks)
      .gravity(0).linkDistance(0).linkStrength(8).charge(-100)
      .size([_self.width, _self.height]);
    force2.start();

    var anchorLink = _self.svg.selectAll("line.anchorLink").data(labelAnchorLinks);
    //.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

    var anchorNode = _self.svg.selectAll("g.anchorNode")
        .data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
    anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
    anchorNode.append("svg:text").text(function(d, i) {
      if (i % 2 == 0) {
        return "";
      } else {
        if (d.node.type)
        {
          return d.node.type;
        }
        return d.node.name;
      }
    }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);

    var updateLink = function() {
      this.attr("x1", function(d) {
        return d.source.x;
      }).attr("y1", function(d) {
        return d.source.y;
      }).attr("x2", function(d) {
        return d.target.x;
      }).attr("y2", function(d) {
        return d.target.y;
      });
    }
    var updateNode = function() {
      this.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }

      // node.append("svg:text").text(function(d) {
      //     return d.label;
      // }).style("fill", "#555")
      //   .style("font-family", "Arial")
      //   .style("font-size", 12);

    _self.force.on("tick", function() {
      force2.start();
      node.call(updateNode);

      anchorNode.each(function(d, i) {
          if(i % 2 == 0) {
            d.x = d.node.x;
            d.y = d.node.y;
          } else {
            var b = this.childNodes[1].getBBox();

            var diffX = d.x - d.node.x;
            var diffY = d.y - d.node.y;

            var dist = Math.sqrt(diffX * diffX + diffY * diffY);

            var shiftX = b.width * (diffX - dist) / (dist * 2);
            shiftX = Math.max(-b.width, Math.min(0, shiftX));
            var shiftY = 5;
            this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
          }
        });

      anchorNode.call(updateNode);

      link.call(updateLink);
      anchorLink.call(updateLink);
    });

  }
}
