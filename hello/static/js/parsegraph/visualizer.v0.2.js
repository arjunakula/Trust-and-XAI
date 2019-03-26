
function drawGraph(root, options) {

    var color = {
        "extended":  "#ffff99",
        "collapsed": "#99CCFF",
        "highlighted": "#cc6600"
    };

    var canvas = options.canvas, tooltip;

    var margin = {
            top:    20,
            right:  120,
            bottom: 20,
            left:   120
        },
        radius = options.radius,
        width  = options.width - margin.right - margin.left,
        height = options.height - margin.top - margin.bottom;

    var i = 0, x = width / 2, y = 0, // = height / 2,
        duration = 750;
    var tree = d3.layout.tree().nodeSize([70, 40]);

    var zm = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", redraw);
    var svg = d3.select(canvas).append("svg")
        .attr("width", width  + margin.left + margin.right)
        .attr("height", height + margin.top  + margin.bottom)
        .call(zm)
        .attr("align", "center")
        .attr("transform", "translate(" + margin.top + "," + margin.left + ")")
        .append("g");

    // build the arrow marker.
    svg.append("svg:defs").selectAll("marker")
        .data(["arrow0", "arrow1"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5"); // "M 0,0 m -5,-5 L 5,0 L -5,5 Z"); //

    //necessary so that zoom knows where to zoom and unzoom from
    zm.translate([400, 200]);

    // root.x0 = 2 * margin.top;
    // root.y0 = width / 2;
    // root.children.forEach(collapse);
    tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    update(root);
    move2center(root);

    // d3.select(canvas).style("height", "800px");

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function diagonal(s, d) {

        // path =  'M ' + d.x + ' ' + d.y +
        //     'C ' + d.x + ' ' + ((s.y + d.y) / 2 + margin.top) +
        //     ', ' + s.x + ' ' + ((s.y + d.y) / 2 - margin.top) +
        //     ', ' + s.x + ' ' + s.y;
        //
        // return path;

        path =  'M ' + d.x + ' ' + d.y +
            ' Q ' + d.x + ' ' + ((s.y + d.y) / 2 - margin.top) +
            ', ' + ((s.x + d.x) / 2) + ' ' + ((s.y + d.y) / 2) +
            ' T ' + s.x + ' ' + s.y;

        return path;
    }

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 80;
        });

        // Update the nodes…
        var node = svg.selectAll("g.pgnode")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "pgnode")
            .attr("transform", function (d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", function (d) {
                return nodeRender(d);
            });

        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .attr("transform", "rotate(-20)")
            .text(function(d) {
                // console.log(d);
                return textRender(d);
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", radius)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", function (d) {
                return nodeRender(d);
            });

        d3.selectAll("circle").attr('cursor', 'pointer')
            .on("mouseover", function (d) {
                tooltipRender(d, true);
            })
            .on("mouseout", function (d) {
                tooltipRender(d, false);
            })
        ;

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text");

        // Update the links…
        var link = svg.selectAll("path.pglink")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "pglink")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal(o, o);
            })
            // .attr("marker-end", "url(#arrow0)")
        ;

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", function(d) { return diagonal(d.target, d.source) })
            // .attr("marker-end", "url(#arrow0)")
            ;
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function () {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal(o, o);
            })
            .remove();

        var lks = link.filter(function (l) {
            var t = l.source, highlighted = false;
            if (options.highlighted.length > 0) {
                options.highlighted.forEach(function (n) {
                    if (t.hasOwnProperty("parent") &&
                        t.parent.hasOwnProperty("name") &&
                        n == t.parent.name) {
                        highlighted = true;
                    }
                });
            }
            return highlighted;
        });

        if (lks.length > 0) {
            // console.log("found " + lks.length + " links");
            lks.style("stroke", "red") //.attr("marker-end", "url(#arrow1)")
            ;
        }

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Function to center node when clicked/dropped so node doesn't get lost
    // when collapsing/moving with large amount of children.

    function nodeRender(node) {
        var highlighted = false;
        // console.log(node);
        options.highlighted.forEach(function (n) {
            if (node.hasOwnProperty("parent") &&
                node.parent.hasOwnProperty("name") &&
                n == node.parent.name) {
                console.log("found " + n + " as highlighted");
                highlighted = true;
            }
        });
        return (highlighted? color.highlighted: (node._children ? color.collapsed: color.extended));
    }

    function textRender(node) {
        return (node.hasOwnProperty("label"))? node.label: node.parent.label;
    }

    function tooltipRender(node, over) {
        if (over) {
            if (node.children || node._children) {
                // console.log(d);
                tooltip.html("<button class='button' id='heat-map-btn'>Heat Map</button>" +
                    "<button id='bar-chart-btn' class='button'>Bar Chart</button>")
                    .style('top', d3.event.pageY - 10 + 'px')
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style("opacity", 0.9);
                d3.select("#heat-map-btn").on("click", function () {
                    console.log(node);
                });
            } else {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            }
        } else {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
    }

    function move2center(source) {
        var scale = zm.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + width / 2;
        y = y * scale + height / 2;
        var g = d3.select('g');
        g.transition()
            .duration(duration)
            .attr("transform", "translate(" + y + "," + x + ")scale(" + scale + ")");
        zm.scale(scale);
        zm.translate([y, x]);
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
        move2center(d);
    }

    //Redraw for zoom
    function redraw() {
        //console.log("here", d3.event.translate, d3.event.scale);
        svg.attr("transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");
    }
}