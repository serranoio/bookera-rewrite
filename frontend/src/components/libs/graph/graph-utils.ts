import Dagre from '@dagrejs/dagre';
// export interface Positioning {
// 	left: number,
// 	top: number,
// }

// export enum PositiningStrategy {
// 	TREE = "tree",
// 	ONE_DIMENSIONAL = "one-dimensional",
// }

// export enum Direction {
// 	HORIZONTAL = "horizontal",
// 	VERTICAL = "vertical",
// }




// export interface Dimensions {
// 	height: number;
// 	width: number;	
// }

// export const findDimensions = (data: any): Dimensions => {
// 	if (!data) return {
// 			height: -1,
// 			width: -1,
// 	}

// 	let heights = [];
// 	let widths = [];
// 	for (const child of data.children) {
// 		const height = findDimensions(child).height
// 		const width = findDimensions(child).width

// 		heights.push(height)
// 		widths.push(width)
// 	}

// 	let maxHeight = 0;

// 	for (const height of heights) {
// 		if (height > maxHeight) {
// 			maxHeight = height
// 		}
// 	}

// 	widths.push(data.children.length)
// 	let maxWidth = 0;
// 	for (const width of widths) {
// 		if (width > maxWidth) {
// 			maxWidth = width
// 		}
// 	}

// 	return {
// 		height: maxHeight + 1,
// 		width:  maxWidth,
// 	}
// }


// export interface Config {
// 	positioningStrategy: PositiningStrategy,
// 	direction: Direction,
// 	sizeOfCanvas: Dimensions,
// 	paddingWidthStart: number;
// 	paddingHeightStart: number;
// 	spacingWidthSize: number;
// 	spacingHeightSize: number;
// }

// interface Size {
// 	width: number,
// 	height: number,
// 	spacingWidthSize: number,
// 	spacingHeightSize: number,
// 	paddingWidthStart: number,
// 	paddingHeightStart: number
// }

// // attachPositioning(this.studioPageData.content.config.outline).map((outline: Outline U Positioning) => {

// // return html`<node style=${styleMap(styles)}>`
// // }

// export const determineSizeOfNode = (maxSize: number, nodeCount: number, spacingSize: number, paddingStart: number): number => {
// 	let amountOfSpaces = nodeCount - 1;

// 	let spaceLeft = maxSize - (amountOfSpaces* spacingSize)  - paddingStart
	
// 	return spaceLeft / nodeCount
// }

// const calculatePositionsTree = (size: Size, data: any, currentWidth: number, currentHeight: number) => {
// 	if (!data) return;

// 	let i = 0;
// 	for (const child of data.children) {

// 		calculatePositionsTree(size, child, i, currentHeight+1)
// 		i++;
// 	}

// 	data.graph = {
// 		left: size.paddingWidthStart + ((currentWidth - 1) * size.spacingWidthSize) + size.width * currentWidth,
// 		top: size.paddingHeightStart + ((currentHeight - 1) * size.spacingHeightSize) + size.height * currentHeight,
// 		width: size.width,
// 		height: size.height,
// 	}
// }
// 2
// // run the data through this function to get the positioning of the elements
// export const attachPositioning = (config: Config, data: any) => {

// 	let dimensions: Dimensions;	
// 	switch (config.positioningStrategy) {
// 		case PositiningStrategy.TREE:
// 		dimensions = findDimensions(data)

		
// 		console.log(dimensions)
// 		dimensions.height = dimensions.height - 1
// 		console.log(dimensions)

// 		break
// 		case PositiningStrategy.ONE_DIMENSIONAL:
// 		if (config.direction === Direction.HORIZONTAL) {
// 			dimensions = {
// 				height: 1,
// 				width: data.children.length
// 			}
// 		} else {
// 			dimensions = {
// 				height: data.children.length,
// 				width: 1
// 			}
// 		}
// 		break
// 	}

// 	let widthOfNode = determineSizeOfNode(config.sizeOfCanvas.width, dimensions.width, config.spacingWidthSize, config.paddingWidthStart)
// 	let heightOfNode = determineSizeOfNode(config.sizeOfCanvas.height, dimensions.height, config.spacingHeightSize, config.paddingHeightStart)

// 	// with the maxSize = widthOfNode + lengthOfSpace  + paddingStart, I can calculate the positions of the elements
// 	// same goes for height
// 	for (const child of data.children) {
// 		calculatePositionsTree(
// 			{
// 				width: widthOfNode,
// 				height: heightOfNode,
// 				spacingWidthSize: config.spacingWidthSize,
// 				spacingHeightSize: config.spacingHeightSize,
// 				paddingWidthStart: config.paddingWidthStart,
// 				paddingHeightStart: config.paddingHeightStart
// 			},
// 			child,
// 			0,
// 			0)
			
// 		}
// 	// console.log(elems)

// }



export const createLayout = () => {
	// Create a new directed graph 
var g = new Dagre.graphlib.Graph();

// Set an object for the graph label
g.setGraph({});

// Default to assigning a new object as a label for each new edge.
g.setDefaultEdgeLabel(function() { return {}; });

// Add nodes to the graph. The first argument is the node id. The second is
// metadata about the node. In this case we're going to add labels to each of
// our nodes.
g.setNode("kspacey",    { label: "Kevin Spacey",  width: 144, height: 100 });
g.setNode("swilliams",  { label: "Saul Williams", width: 160, height: 100 });
g.setNode("bpitt",      { label: "Brad Pitt",     width: 108, height: 100 });
g.setNode("hford",      { label: "Harrison Ford", width: 168, height: 100 });
g.setNode("lwilson",    { label: "Luke Wilson",   width: 144, height: 100 });
g.setNode("kbacon",     { label: "Kevin Bacon",   width: 121, height: 100 });

// Add edges to the graph.
g.setEdge("kspacey",   "swilliams");
g.setEdge("swilliams", "kbacon");
g.setEdge("bpitt",     "kbacon");
g.setEdge("hford",     "lwilson");
g.setEdge("lwilson",   "kbacon");


Dagre.layout(g);

console.log(g)
}
