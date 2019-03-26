/**
 * Description: The Dot Graph to Json Compatible Graph
 * Author: Shi, Feng
 * Date of Creation: July 12th, 2017
 */
/// the class which is used to transform the graph of .dot format into a
/// json friendly graph structure

function JGraph (dotNodes, dotEdges) {
	this.nodes = [];
	this.edges = [];

    var node_name_to_idx = {};
	
	// class jNode 
	// create the object for each node, 
	// then put them into the list of nodes
	var key;
	for (key in dotNodes) {
		var node = dotNodes[key].attrs;
		node["name"] = key;
		this.nodes.push(node);
        node_name_to_idx[key] = this.nodes.length - 1;
	}

	// convert the edge array in dot-format into json friendly format
	for (key in dotEdges) {
		var edge = dotEdges[key]["0"];
		// create an edge object, 
		// then put it into the list of edges
		var src = this.nodes[node_name_to_idx[edge.edge["0"]]];
		var dst = this.nodes[node_name_to_idx[edge.edge["1"]]];

        var link = {
            source: src,
            target: dst
        };

        // if (edge.attrs.hasOwnProperty("position")) {
        // 	if (edge.attrs.position == null)
        // 		dst.pos = 0.0;
        // 	else
        // 		dst.pos = edge.attrs.position;
        // }
        // if (edge.attrs.hasOwnProperty("probability")) {
        // 	dst.probability = edge.attrs.probability;
        // }

		if (edge.attrs.hasOwnProperty("label")) {
			// link.label = edge.attrs.label;
			dst.link = edge.attrs.label;
		}

		link.name = key;

		// also, put the target into the children list of a source node
		if (src.hasOwnProperty("children")) {
			src.children.push(dst);
		} else { // for the case the list of children is still empty
			var children = [];
			children.push(dst);
			src.children = children;
		}
		this.edges.push(link);
	}
	this.root = getRoot(this.nodes, this.edges);
}

function getRoot(nodes, edges) {
	////// looking for the root of the graph
	// 1. copy nodes into a temporary list
	//    (using a hash-table for nodes may be better for performance (speed))
	var key, nds = [];
	for (key in nodes){ nds.push(nodes[key]); }
	// 2. delete each node that is a target node in an edge
	for (key in edges) {
		var idx = nds.indexOf(edges[key].target);
		if (idx !== -1) nds.splice(idx, 1);
	}
	// 3. return the first element which has no parent
    return nds[0];
}

function dot2json(str) {
    var ast   = DotParser.parse(str);
    var graph = new DotGraph(ast);
    graph.walk(ast);
    // console.log(graph);
    var jg = new JGraph(graph.nodes, graph.edges);
    return jg;
}