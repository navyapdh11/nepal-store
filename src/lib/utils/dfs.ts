export interface TreeNode {
	id: string;
	name: string;
	children?: TreeNode[];
}

/**
 * Depth-First Search to find a node by ID in a hierarchical tree.
 * Used for regional navigation (Province > District > Municipality)
 * and deep category traversal.
 */
export function findNodeDFS(
	nodes: TreeNode[],
	targetId: string,
): TreeNode | null {
	for (const node of nodes) {
		if (node.id === targetId) {
			return node;
		}
		if (node.children) {
			const found = findNodeDFS(node.children, targetId);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Flatten a tree structure using DFS.
 */
export function flattenTreeDFS(
	nodes: TreeNode[],
	result: TreeNode[] = [],
): TreeNode[] {
	for (const node of nodes) {
		result.push(node);
		if (node.children) {
			flattenTreeDFS(node.children, result);
		}
	}
	return result;
}

/**
 * Example Nepal Regional Hierarchy
 */
export const NEPAL_REGIONS: TreeNode[] = [
	{
		id: "p3",
		name: "Bagmati Province",
		children: [
			{
				id: "p3-ktm",
				name: "Kathmandu District",
				children: [
					{ id: "ktm-met", name: "Kathmandu Metropolitan" },
					{ id: "ktm-lal", name: "Lalitpur" },
				],
			},
			{
				id: "p3-bkt",
				name: "Bhaktapur District",
				children: [{ id: "bkt-mun", name: "Bhaktapur Municipality" }],
			},
		],
	},
	{
		id: "p1",
		name: "Koshi Province",
		children: [{ id: "p1-mor", name: "Morang District" }],
	},
];
