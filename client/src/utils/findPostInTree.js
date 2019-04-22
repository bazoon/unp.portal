export default function findInTree(tree, leaf) {
  for (let i = 0; i < tree.length; i++) {
    let subTree = tree[i];
    if (subTree.id === leaf.parentId) {
      return subTree;
    }
    if (subTree.children && subTree.children.length > 0) {
      const foundLeaf = findInTree(subTree.children, leaf);
      if (foundLeaf) {
        return foundLeaf;
      }
    }
  }
}
