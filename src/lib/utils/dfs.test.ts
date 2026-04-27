import { describe, expect, it } from "vitest";
import { findNodeDFS, flattenTreeDFS, type TreeNode } from "./dfs";

const testTree: TreeNode[] = [
	{
		id: "1",
		name: "Node 1",
		children: [
			{ id: "1-1", name: "Node 1.1" },
			{
				id: "1-2",
				name: "Node 1.2",
				children: [{ id: "1-2-1", name: "Node 1.2.1" }],
			},
		],
	},
	{ id: "2", name: "Node 2" },
];

describe("DFS Utilities", () => {
	it("should find a node by ID using DFS", () => {
		const result = findNodeDFS(testTree, "1-2-1");
		expect(result).toBeDefined();
		expect(result?.name).toBe("Node 1.2.1");
	});

	it("should return null if node is not found", () => {
		const result = findNodeDFS(testTree, "non-existent");
		expect(result).toBeNull();
	});

	it("should flatten a tree using DFS", () => {
		const result = flattenTreeDFS(testTree);
		expect(result).toHaveLength(5);
		expect(result.map((n) => n.id)).toEqual(["1", "1-1", "1-2", "1-2-1", "2"]);
	});
});
