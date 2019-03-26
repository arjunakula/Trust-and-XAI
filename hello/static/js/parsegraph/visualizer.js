function ParseGraphRender(container, viewerWidth, viewerHeight, radius) {
    var _self = this;
    this.color = {
        "extended":  "#c1ffff",
        "collapsed": "#99CCFF",
        "highlighted": "#cc6600"
    };
    _self.color_channel = [
        "#2aff6a",
        "#99b3ff",
        "#ff0066",
        "#ff0066"
    ];

    this.width = viewerWidth; // - this.margin.right - this.margin.left;

    this.height = viewerHeight; // - this.margin.top - this.margin.bottom;

    this.x = this.width / 2;

    this.y = this.height / 2; // = height / 2,

    this.i = 0;

    this.duration = 750;

    this.container = container;

    // this.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    this.tooltip = d3.tip().attr("class", "d3-tip")
                .attr("id", "tooltipPg")
                .offset([45, 0])
                .html("<div id='tipDiv'></div><br>");

    this.tree = d3.layout.tree().nodeSize([70, 40]);

    this.radius = radius;

    this.svg;

    this.zm;

    this.clear = function(){
        // $( _self.container ).empty();
        // _self.svg.selectAll("*").remove();
        var container = d3.select(_self.container);
        if (!container.select("svg").empty())
            container.selectAll("svg").remove();
    };

    /* (frameid)_(personid)_(keypointid)_(channelid).png

    keypointid: 1-24
    bottom layer:
        1 right ankle 2 right knee 3right hem 4 left hem
        5 left knee 6 left ankle 7 spine tail 8 spine top
        9 neck 10 head 11 right wrist 12 right elbow
        13 right shoulder 14 left shoulder
    15 left elbow 16 left wrist

    second layer:
        17 right leg 18 left leg 19 right arm 20 left arm 21 torso

    third layer:
        22 lower human body 23 upper human body

    top layer:

        24 (center of) full body

    channelid: 1-4

    1. alpha
    2. belta
    3. gamma
    4. final prediction */

    this.codeMapping = {
        "part": {
            "right ankle": 1,
            "right knee": 2,
            "right hem": 3,
            "left hem": 4,
            "left knee": 5,
            "left ankle": 6,
            "spine tail": 7,
            "spine top": 8,
            "neck": 9,
            "head": 10,
            "right wrist": 11,
            "right elbow": 12,
            "right shoulder": 13,
            "left shoulder": 14,
            "left elbow": 15,
            "left wrist": 16,
            "right leg": 17,
            "left leg": 18,
            "right arm": 19,
            "left arm": 20,
            "torso": 21,
            "lower body": 22,
            "upper body": 23,
            "full body": 24
        },
        "channel": {
            "alpha": 1,
            "beta": 2,
            "gamma": 3,
            "final prediction": 4
        }
    };

    this.showHeatmap = function (node, channel) {
        // "(frameid)_(personid)_(keypointid)_(channelid).png"
        var frameId   = node.frameid,
            personId  = node.personid,
            nameId    = _self.codeMapping.part[node.label],
            channelId = channel; // _self.codeMapping.channel[channel];

        var imgPath = "/static/data/heatmaps/" +
                      frameId + "_" +
                      personId + "_" +
                      nameId + "_" +
                      channelId + ".png";

        console.log(imgPath);
        var img = document.createElement("img");
        img.src = imgPath;
        $('#hm-pg-img').html(img).show();
    };

    this.drawGraph = function (root) {

        _self.zm  = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", redraw);

        _self.svg = d3.select(_self.container).append("svg")
            .attr("width",  _self.width)
            .attr("height", _self.height)
            .call(_self.zm)
            .attr("align", "center")
            .append("g");

        _self.svg.call(_self.tooltip);

        // build the arrow marker.
        _self.svg.append("svg:defs").selectAll("marker")
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
            .attr("d", "M0,-5L10,0L0,5");

        //necessary so that zoom knows where to zoom and unzoom from
         _self.zm.translate([400, 200]);

        root.x0 = 20;
        root.y0 = _self.width / 2;
        // root.children.forEach(collapse);
        // console.log(root);
        update(root);

        move2center(root);

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function diagonal(s, d) {

            // var path =  'M ' + d.x + ' ' + d.y +
            //     'C ' + d.x + ' ' + ((s.y + d.y) / 2 + margin.top) +
            //     ', ' + s.x + ' ' + ((s.y + d.y) / 2 - margin.top) +
            //     ', ' + s.x + ' ' + s.y;
            //
            // return path;

            return 'M ' + d.x + ' ' + d.y +
                ' Q ' + d.x + ' ' + ((s.y + d.y) / 2 - 20) + // - _self.margin.top) +
                ', ' + ((s.x + d.x) / 2) + ' ' + ((s.y + d.y) / 2) +
                ' T ' + s.x + ' ' + s.y;
        }

        function update(source) {

            // console.log(source);
            // Compute the new tree layout.
            var nodes = _self.tree.nodes(root).reverse(),
                links = _self.tree.links(nodes);

            // console.log(links);
            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 80;
            });

            // Update the nodes…
            var node = _self.svg.selectAll("g.pgnode")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++_self.i);
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
                    var toLeft = false;
                    if (d.hasOwnProperty("parent") && d.parent.hasOwnProperty("x") && (d.parent.x > d.x)) {
                        toLeft = true;
                    }
                    return toLeft? -(_self.radius + 3): (_self.radius + 3);
                    //TODO (OLD) return d.children || d._children ? -(_self.radius + 3): (_self.radius + 3);
                })
                .attr("y", function (d) {
                     // (d.children || d._children) &&
                    // return ( (d.hasOwnProperty("parent") &&
                    //          (d.parent.hasOwnProperty("x"))) &&
                    //          (d.x == d.parent.x))? -(_self.radius + 3): (_self.radius + 3);
                    return (_self.radius + 7);
                })
                .attr("text-anchor", function(d) {
                    var toLeft = false;
                    if (d.hasOwnProperty("parent") && d.parent.hasOwnProperty("x") && (d.parent.x >= d.x)) {
                        toLeft = true;
                    }
                    return toLeft? "end": "start";

                    // console.log(d);
                    //TODO (OLD) return d.children || d._children ? "end" : "start";
                })
                .attr("transform", "rotate(-20)")
                .text(function(d) {
                    return textRender(d);
                })
                .attr("font-size", 15);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(_self.duration)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", _self.radius)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .style("fill", function (d) {
                    return nodeRender(d);
                });

            d3.selectAll("g.pgnode").selectAll("circle")
                .attr('cursor', 'pointer')
                .on("mouseover", function (d) {
                    tooltipRender(d);
                })
            ;

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(_self.duration)
                .attr("transform", function (d) {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text");

            // Update the links…
            var link = _self.svg.selectAll("path.pglink")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "pglink")
                .attr("d", function () {
                    // console.log(d);
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal(o, o);
                })
                .on("mouseover", function () {
                    _self.tooltip.hide(function (d) {
                        return d;
                    });
                })

                // .attr("marker-end", "url(#arrow0)")
            ;
            // Transition links to their new position.
            link.transition()
                .duration(_self.duration)
                .attr("d", function(d) { return diagonal(d.target, d.source) })
                // .attr("marker-end", "url(#arrow0)")
                ;

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(_self.duration)
                .attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal(o, o);
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Function to center node when clicked/dropped so node doesn't get lost
        // when collapsing/moving with large amount of children.

        function nodeRender(node) {
            return node._children ? _self.color.collapsed : _self.color.extended;
        }

        function textRender(node) {
            return (node.hasOwnProperty("label"))? node.label: node.parent.label;
        }

        function tooltipRender(node) {
            _self.tooltip.show(node);

            var data = [
                // (node.XUtility == null) ? 0 : node.XUtility,
                (node.gamma_normalized == null)? 0: node.gamma_normalized,
                (node.alpha_normalized == null)? 0: node.alpha_normalized,
                (node.beta_normalized  == null)? 0: node.beta_normalized
                
            ];
            // var text = [ "X-utility","gamma", "alpha", "beta"];
            var text = ["gamma", "alpha", "beta"];
            var channels = [3, 1, 2];
            var arrowUnicode = ['\u2b07', '\u2b05', '\u2b06'];
            // var arrowUnicode = [' ', '\u2b07', '\u2b05', '\u2b06']; // ['\u21E9', '\u21E6', '\u21E7'];

            var barHeight = 25;
            var barWidth  = 120;

            var tipSVG = d3.select("#tipDiv")
                .append("svg")
                .attr("width", barWidth)
                .attr("height", barHeight * 3) // adjust the barheight
                .style("opacity", 1);

            var x = d3.scale.linear()
                .domain([0, d3.max(data)])
                .range([0, 100]);

            var bar = tipSVG.selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("transform", function(d, i) {
                    return "translate(0," + i * barHeight + ")";
                })
                // .on("click", function (d, i) {
                //     _self.showHeatmap(node, channels[i]);
                // })

            bar.append("rect")
                .attr("width", 0)
                .attr("fill", function(d, i) {
                    return _self.color_channel[i];
                })
                //.attr("height", bar)
                .transition()
                .duration(1000)
                .attr("width", function (d) {
                    return d * barWidth;
                })
                .attr("height", barHeight - 1)
            ;

            bar.append("text")
                .attr("class", "d3-tip-btn")
                .attr("x", 2)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .attr("fill", "black")
                .style("font-size", "14px")
                .html(function(d, i) {
                    // if (i > 0) return arrowUnicode[i] + " " + text[i] + " = " + d * 100 + "%";
                    // return text[i] + " = " + d * 100 + "%";
                    return arrowUnicode[i] + " " + text[i] + " = " + d * 100 + "%";
                });
        }

        function move2center(source) {
            var scale = _self.zm.scale();

            // console.log(scale);

            _self.x = -source.y0;
            _self.y = -source.x0;
            _self.x = _self.x * scale + _self.width / 3;
            _self.y = _self.y * scale + _self.height / 2;
            // var g = d3.select('g');
            // g.transition()

            _self.svg.transition()
                .duration(_self.duration)
                .attr("transform", "translate(" + _self.y + "," + _self.x + ")scale(" + scale + ")");
            _self.zm.scale(scale);
            _self.zm.translate([_self.y, _self.x]);
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
            _self.svg.attr("transform",
                "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");
        }
    };

    this.highlightNode = function (nodes){

        var node = _self.svg.selectAll("circle")
            .filter(function (t) {
                var highlighted = false;
                nodes.forEach(function (n) {
                    if (t.hasOwnProperty("name") &&
                        n == t.name) {
                        highlighted = true;
                    }
                });
                return highlighted;
            });
        node.style("stroke", "#D35400")
            .style("fill", "red")
            .style("stroke-width", 8);

        // var link = _self.svg.selectAll("path.pglink")
        //     .filter(function (l) {
        //         var t = l.source, highlighted = false;
        //         nodes.forEach(function (n) {
        //             if (t.hasOwnProperty("name") &&
        //                 n == t.name) {
        //                 highlighted = true;
        //             }
        //         });

        //         return highlighted;
        //     });
        // link.style("stroke", "red").style("stroke-width", 4);
    };

    this.highlightEdge = function (edges) {

        var re = /\s*:\s*/;
        var link = _self.svg.selectAll("path.pglink")
            .filter(function (l){
                var sourceFound = false, targetFound = false;
                var s = l.source, t = l.target;
                edges.forEach(function (n) {
                    var ns = n.split(re);
                    if (s.hasOwnProperty("name") && s.name == ns[0]) sourceFound = true;
                    if (t.hasOwnProperty("name") && t.name == ns[1]) targetFound = true;
                });

                return sourceFound && targetFound;
            });
        link.style("stroke", "#D35400").style("stroke-width", 4);
    };

    this.drawHistogram = function (container, width, height, data) {
        var tip = d3.tip()
            .attr("class", 'd3-tip')
            .offset([-10, 0])
            .html(function (d, i) {
                return "<strong>" + data.label[i] + "</strong>";
            });

        var y = d3.scale.linear().range([height, 0]);

        var barWidth = 20; // width / data.length;
        var barPadding = 1;
        var barHeight = height / 2;

        var chart = d3.select(container)
            .append("svg")
            .attr("width",  width)
            .attr("height", height)
            .append("g")
            ;

        chart.call(tip);

        var bar = chart.selectAll("rect")
            .data(data.value)
            .enter()
            .append("g")
            .attr("class", "histogram")
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        bar.append("rect")
            .attr("x", function (d, i) {
                return i * barWidth;
            })
            .attr("y", function(d){ return barHeight * (1 - d); })
            .attr("width", barWidth - barPadding)
            .attr("height", function (d) { return d * barHeight;})
            .attr("fill", function (d, i) {
                return _self.color_channel[ i % _self.color_channel.length ];
            })
        ;

        bar.append("text")
            .text(function (d) { return d; })
            .attr("x", function (d, i) { return barWidth * (i + 0.5); })
            .attr("y", function (d) { return barHeight * (1 - d) + 10;} )
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            // .attr("transform", "rotate(60)")
        ;
    };
}
